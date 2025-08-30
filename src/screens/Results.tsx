import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';

export default function Results() {
  const router = useRouter();
  const { uris = '[]' } = useLocalSearchParams<{ uris: string }>();
  const list: string[] = JSON.parse(Array.isArray(uris) ? uris[0] : uris);
  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 56 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 }}>Your Results</Text>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {list.map((uri, i) => (
          <Image key={i} source={{ uri }} style={{ width: '100%', height: 300, borderRadius: 12 }} />
        ))}
        <Pressable onPress={() => router.replace('/(tabs)')} style={{ backgroundColor: '#00e5ff', padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700', textAlign: 'center' }}>Back to Home</Text>
        </Pressable>
        <Text style={{ color: '#666', textAlign: 'center' }}>Saved to device in app folder.</Text>
      </ScrollView>
    </View>
  );
}

