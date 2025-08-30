import { ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function Terms() {
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Pressable
          onPress={() => {
            // Prefer real back; fallback to settings tab
            // @ts-ignore canGoBack exists on navigation
            if (navigation?.canGoBack?.()) navigation.goBack();
            else router.replace('/(tabs)/settings');
          }}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Terms of Use</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb' }}>
          These Terms of Use are a placeholder. Replace with your legal terms. By using this app you agree to the
          terms and policies provided by the company.
        </Text>
      </View>
    </ScrollView>
  );
}
