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
            router.back();
          }}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Privacy Policy</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb', lineHeight: 20 }}>
          We respect your privacy. This policy explains what we collect and why.
          {'\n\n'}
          Data we collect:
          {'\n'}
          - Account data: email, display name (to sign you in and manage your account).
          {'\n'}
          - Usage data: generation requests and credits used (to provide the service and prevent abuse).
          {'\n'}
          - Optional feedback you submit.
          {'\n\n'}
          Content you upload is used to generate results and operate the service. We don’t sell your content or personal data.
          {'\n\n'}
          Storage & retention: We keep data only as long as necessary to provide the service or comply with legal obligations. You can request deletion of your account at any time.
          {'\n\n'}
          Third parties: We use trusted processors (e.g., cloud providers, payment processors) strictly to run the app. Purchases are handled by app stores.
          {'\n\n'}
          Your rights: Access, correct, or delete your data. Contact us at support@ruvia.art.
          {'\n\n'}
          Changes: We may update this policy; continued use means acceptance.
        </Text>
      </View>
    </ScrollView>
  );
}
