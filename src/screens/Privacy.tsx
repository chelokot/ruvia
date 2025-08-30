import { ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Privacy() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Pressable
          onPress={() => {
            // Prefer router back; fallback to settings tab route
            // @ts-ignore canGoBack is available on expo-router router
            if (router.canGoBack?.()) router.back();
            else router.replace('/settings');
          }}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Privacy Policy</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb' }}>
          This is a placeholder for your Privacy Policy. Replace this with your actual policy content describing data
          collection, usage, storage, and user rights.
        </Text>
      </View>
    </ScrollView>
  );
}
