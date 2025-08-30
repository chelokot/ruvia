import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LogoTitle({ title = 'Ruvia' }: { title?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name="sparkles" size={22} color="#00e5ff" />
      <Text accessibilityRole="header" style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{title}</Text>
    </View>
  );
}

