import { ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Terms() {
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
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Terms of Use</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb', lineHeight: 20 }}>
          Welcome to Ruvia. By using the app, you agree to these terms.
          {'\n\n'}
          1) Eligibility: You must be 18+ or have parental consent.
          {'\n'}
          2) Your Content: Upload only content you own or have rights to. Do not upload images of minors or illegal, abusive, or infringing content.
          {'\n'}
          3) License: You grant us a limited license to process your content for generating results and operating the service. We do not sell your content.
          {'\n'}
          4) Results: AI outputs may vary. The service is provided “as is,” without warranties of fitness for a particular purpose.
          {'\n'}
          5) Credits & Billing: Credits are consumed when generating. Purchases are handled by app stores. Refunds follow store policies unless required by law.
          {'\n'}
          6) Privacy: See the Privacy Policy regarding data.
          {'\n'}
          7) Conduct: No harassment, hate, or misuse.
          {'\n'}
          8) Termination: We may suspend access for violations.
          {'\n'}
          9) Changes: We may update terms; continued use means acceptance.
          {'\n\n'}
          Contact: support@ruvia.art
        </Text>
      </View>
    </ScrollView>
  );
}
