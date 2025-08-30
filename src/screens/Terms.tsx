import { ScrollView, Text, View } from 'react-native';

export default function Terms() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Terms of Use</Text>
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb' }}>
          These Terms of Use are a placeholder. Replace with your legal terms. By using this app you agree to the
          terms and policies provided by the company.
        </Text>
      </View>
    </ScrollView>
  );
}

