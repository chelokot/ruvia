import { View, Text, Pressable, Alert } from 'react-native';
import { confirmPurchase } from '@/lib/api';
import { Platform } from 'react-native';

type Plan = { sku: string; title: string; price: string; credits: number };
const PLANS: Plan[] = [
  { sku: 'ruvia_25_500', title: '25 profile pictures', price: '$5.00', credits: 25 },
  { sku: 'ruvia_150_3000', title: '150 profile pictures', price: '$30.00', credits: 150 },
  { sku: 'ruvia_1000_10000', title: '1000 profile pictures', price: '$100.00', credits: 1000 },
];

export default function Purchase() {
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
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 56, paddingHorizontal: 16 }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16 }}>Buy more generations</Text>
      {PLANS.map((p) => (
        <View key={p.sku} style={{ backgroundColor: '#111', borderColor: '#222', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{p.title}</Text>
          <Text style={{ color: '#bbb', marginTop: 4 }}>{p.price}</Text>
          <Pressable onPress={() => buy(p)} style={{ marginTop: 12, backgroundColor: '#00e5ff', padding: 12, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Pay with Google Play</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

