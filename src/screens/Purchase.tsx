import { View, Text, Pressable, Alert, Image, Animated, Easing } from 'react-native';
import { confirmPurchase } from '@/lib/api';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as colors from '@/theme/theme';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { beginPurchaseFlow, captureMonitoringError, createCorrelationId, logPurchaseStage } from '@/lib/monitoring';
// Loaded dynamically on Android to avoid web build issues
// import * as InAppPurchases from 'expo-in-app-purchases';
import { useAuth } from '@/hooks/useAuth';
import PrimaryButton from '@/components/ui/PrimaryButton';

type Plan = { sku: string; title: string; price: string; credits: number; save?: string };
const STATIC_PLANS: Plan[] = [
  { sku: 'ruvia_25_500', title: '25 profile pictures', price: '$5.00', credits: 25 },
  { sku: 'ruvia_150_2000', title: '150 profile pictures', price: '$20.00', credits: 150, save: 'Save 33%' },
  { sku: 'ruvia_1000_10000', title: '1000 profile pictures', price: '$100.00', credits: 1000, save: 'Save 50%' },
];

// Carousel images (same set as on the sign-up screen), combined into one row
const row1 = [
  require('../../assets/register/row1/img01.webp'),
  require('../../assets/register/row1/img02.webp'),
  require('../../assets/register/row1/img03.webp'),
  require('../../assets/register/row1/img04.webp'),
  require('../../assets/register/row1/img05.webp'),
  require('../../assets/register/row1/img06.webp'),
  require('../../assets/register/row1/img07.webp'),
  require('../../assets/register/row1/img08.webp'),
  require('../../assets/register/row1/img09.webp'),
  require('../../assets/register/row1/img10.webp'),
];
const row2 = [
  require('../../assets/register/row2/img01.webp'),
  require('../../assets/register/row2/img02.webp'),
  require('../../assets/register/row2/img03.webp'),
  require('../../assets/register/row2/img04.webp'),
  require('../../assets/register/row2/img05.webp'),
  require('../../assets/register/row2/img06.webp'),
  require('../../assets/register/row2/img07.webp'),
  require('../../assets/register/row2/img08.webp'),
  require('../../assets/register/row2/img09.webp'),
  require('../../assets/register/row2/img10.webp'),
];
const row3 = [
  require('../../assets/register/row3/img01.webp'),
  require('../../assets/register/row3/img02.webp'),
  require('../../assets/register/row3/img03.webp'),
  require('../../assets/register/row3/img04.webp'),
  require('../../assets/register/row3/img05.webp'),
  require('../../assets/register/row3/img06.webp'),
  require('../../assets/register/row3/img07.webp'),
  require('../../assets/register/row3/img08.webp'),
  require('../../assets/register/row3/img09.webp'),
  require('../../assets/register/row3/img10.webp'),
];
const allImages = [...row1, ...row2, ...row3];

function MarqueeRowSingle({
  images,
  itemSize = 90,
  gap = 8,
  speed = 50,
  borderRadius = 10,
}: { images: any[]; itemSize?: number; gap?: number; speed?: number; borderRadius?: number }) {
  const items = images.length;
  const rowWidth = items > 0 ? items * itemSize + Math.max(0, items - 1) * gap : 0;
  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (items === 0 || rowWidth === 0) return;
    const distance = rowWidth + gap;
    const duration = Math.max(3000, Math.round((distance / speed) * 1000));
    const start = () => {
      translateX.stopAnimation();
      translateX.setValue(0);
      const anim = Animated.timing(translateX, {
        toValue: -distance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      animRef.current = anim;
      anim.start(({ finished }) => { if (finished) start(); });
    };
    start();
    return () => { animRef.current?.stop?.(); };
  }, [gap, items, rowWidth, speed, translateX]);

  if (items === 0) return null;
  return (
    <View style={{ height: itemSize, overflow: 'hidden' }}>
      <Animated.View style={{ flexDirection: 'row', gap, transform: [{ translateX }] }}>
        {[0, 1].map((dup) => (
          <View key={dup} style={{ flexDirection: 'row', gap }}>
            {images.map((src, i) => (
              <Image key={`${dup}-${i}`} source={src} style={{ width: itemSize, height: itemSize, borderRadius }} resizeMode="cover" />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default function Purchase() {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string>(STATIC_PLANS[0].sku);
  const [plans, setPlans] = useState<Plan[]>(STATIC_PLANS);
  const [loading, setLoading] = useState(false);
  const iapRef = useRef<any | null>(null);
  const purchaseFlowRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (Platform.OS !== 'android') return;
      try {
        const IAP = await import('@/lib/iap');
        iapRef.current = IAP;
        await IAP.connectAsync();
        const skus = STATIC_PLANS.map(p => p.sku);
        const results = await IAP.getProductsAsync(skus);
        if (mounted && results) {
          const mapped = STATIC_PLANS.map(p => {
            const storeItem: any = results.find((r: any) => r.productId === p.sku);
            return storeItem ? { ...p, title: storeItem.title, price: storeItem.localizedPrice ?? storeItem.price } : p;
          });
          setPlans(mapped);
        }
      } catch (e) {
        // ignore and keep static pricing
      }
    }
    init();
    return () => {
      mounted = false;
      // no explicit disconnect for react-native-iap
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let remove: any | undefined;
    (async () => {
      const IAP = iapRef.current ?? (await import('@/lib/iap'));
      remove = IAP.setPurchaseListener(async (purchase: any) => {
        try {
          if (!user) throw new Error('Not signed in');
          const tokenSuffix = purchase.purchaseToken ? String(purchase.purchaseToken).slice(-12) : undefined;
          const currentSku = purchase.productId ?? selected;
          if (!purchaseFlowRef.current) {
            purchaseFlowRef.current = createCorrelationId();
            logPurchaseStage({ stage: 'recovered', correlationId: purchaseFlowRef.current, sku: currentSku, tokenSuffix });
          }
          logPurchaseStage({ stage: 'listener_received', correlationId: purchaseFlowRef.current, sku: currentSku, tokenSuffix, status: String(purchase.purchaseState ?? 'unknown') });
          const idToken = await user.getIdToken();
          logPurchaseStage({ stage: 'backend_request', correlationId: purchaseFlowRef.current, sku: currentSku, tokenSuffix });
          const response = await confirmPurchase({ sku: currentSku, purchaseToken: purchase.purchaseToken!, correlationId: purchaseFlowRef.current }, idToken);
          logPurchaseStage({ stage: 'backend_response', correlationId: purchaseFlowRef.current, sku: currentSku, tokenSuffix, status: response?.ok ? 'ok' : 'error', extra: response ? { ok: response.ok, credits: response.credits, alreadyProcessed: response.alreadyProcessed ?? false } : undefined });
          await IAP.finishTransactionAsync(purchase);
          logPurchaseStage({ stage: 'finish_transaction', correlationId: purchaseFlowRef.current, sku: currentSku, tokenSuffix, status: 'completed' });
          purchaseFlowRef.current = null;
          Alert.alert('Purchase', 'Thanks! Your credits will update shortly.');
        } catch (e: any) {
          const failureSuffix = purchase.purchaseToken ? String(purchase.purchaseToken).slice(-12) : undefined;
          logPurchaseStage({ stage: 'listener_failed', correlationId: purchaseFlowRef.current ?? createCorrelationId(), sku: purchase.productId ?? selected, status: 'error', error: e?.message ?? 'unknown', tokenSuffix: failureSuffix });
          captureMonitoringError(e, { source: 'purchaseListener', sku: purchase.productId, tokenSuffix: failureSuffix }, purchaseFlowRef.current ?? undefined);
          Alert.alert('Purchase failed', e?.message ?? 'Please try again later');
          purchaseFlowRef.current = null;
        }
      });
    })();
    return () => {
      remove?.remove?.();
    };
  }, [user]);

  async function buy(p: Plan) {
    try {
      if (Platform.OS !== 'android') {
        Alert.alert('Unavailable', 'Purchases are available on Android via Google Play.');
        return;
      }
      setLoading(true);
      purchaseFlowRef.current = beginPurchaseFlow(p.sku);
      const IAP = iapRef.current ?? (await import('@/lib/iap'));
      await IAP.purchaseItemAsync(p.sku);
      logPurchaseStage({ stage: 'iap_request_sent', correlationId: purchaseFlowRef.current, sku: p.sku, status: 'pending' });
    } catch (e: any) {
      logPurchaseStage({ stage: 'iap_request_failed', correlationId: purchaseFlowRef.current ?? createCorrelationId(), sku: p.sku, status: 'error', error: e.message ?? 'unknown' });
      captureMonitoringError(e, { source: 'purchaseRequest', sku: p.sku }, purchaseFlowRef.current ?? undefined);
      Alert.alert('Purchase failed', e.message ?? 'Please try again later');
      purchaseFlowRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#111', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Purchase</Text>
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: '#0b0b0b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#111' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Buy more generations</Text>
          <Text style={{ color: '#bbb', marginTop: 6 }}>
            Unlock more AI profile pictures by purchasing credits. Choose a pack below — higher tiers offer better value.
          </Text>
        </View>

        {/* Carousel between header and options */}
        <MarqueeRowSingle images={allImages} />

        <View style={{ gap: 12 }}>
          {plans.map((p) => {
            const active = p.sku === selected;
            return (
              <Pressable key={p.sku} onPress={() => setSelected(p.sku)} style={{ backgroundColor: '#111', borderColor: active ? colors.PRIMARY : '#222', borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: active ? colors.PRIMARY : '#444', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  {active && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.PRIMARY }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{p.title}</Text>
                  <Text style={{ color: '#bbb', marginTop: 2 }}>{p.price}</Text>
                </View>
                {!!p.save && (
                  <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.PRIMARY_TINT, borderColor: colors.PRIMARY, borderWidth: 1 }}>
                    <Text style={{ color: colors.PRIMARY, fontSize: 12, fontWeight: '700' }}>{p.save}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopColor: '#111', borderTopWidth: 1, backgroundColor: '#000' }}>
        <PrimaryButton
          title={loading ? 'Processing…' : 'Buy'}
          onPress={() => buy(plans.find((p) => p.sku === selected)!)}
          disabled={loading}
        />
      </View>
    </View>
  );
}
