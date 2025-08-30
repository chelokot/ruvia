import { View, Text, Pressable, Alert } from 'react-native';
import { confirmPurchase } from '@/lib/api';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

type Plan = { sku: string; title: string; price: string; credits: number; save?: string };
const PLANS: Plan[] = [
  { sku: 'ruvia_25_500', title: '25 profile pictures', price: '$5.00', credits: 25 },
  { sku: 'ruvia_150_3000', title: '150 profile pictures', price: '$30.00', credits: 150, save: 'Save 10%' },
  { sku: 'ruvia_1000_10000', title: '1000 profile pictures', price: '$100.00', credits: 1000, save: 'Save 35%' },
];

export default function Purchase() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(PLANS[0].sku);
  async function buy(p: Plan) {
    // Stub: integrate Play Billing on Android later; call backend regardless
    try {
      await confirmPurchase({ sku: p.sku, platform: Platform.OS === 'android' ? 'android' : 'web' });
      Alert.alert('Purchase', 'Thanks! Your balance will update shortly.');
    } catch (e: any) {
      Alert.alert('Purchase failed', e.message ?? 'Please try again later');
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
            Unlock more AI profile pictures by purchasing credits. Choose a plan below — higher tiers offer better value.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {PLANS.map((p) => {
            const active = p.sku === selected;
            return (
              <Pressable key={p.sku} onPress={() => setSelected(p.sku)} style={{ backgroundColor: '#111', borderColor: active ? '#00e5ff' : '#222', borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: active ? '#00e5ff' : '#444', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  {active && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#00e5ff' }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{p.title}</Text>
                  <Text style={{ color: '#bbb', marginTop: 2 }}>{p.price}</Text>
                </View>
                {!!p.save && (
                  <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(0,229,255,0.12)', borderColor: '#00e5ff', borderWidth: 1 }}>
                    <Text style={{ color: '#00e5ff', fontSize: 12, fontWeight: '700' }}>{p.save}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopColor: '#111', borderTopWidth: 1, backgroundColor: '#000' }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => buy(PLANS.find((p) => p.sku === selected)!)}
          style={{ backgroundColor: '#00e5ff', padding: 14, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#000', fontWeight: '800' }}>Pay</Text>
        </Pressable>
      </View>
    </View>
  );
}
