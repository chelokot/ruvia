import { View, Text, Image } from 'react-native';
import * as colors from '@/theme/colors';

export default function LogoTitle({ title = 'Ruvia' }: { title?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image source={require('../../assets/icon.png')} style={{ width: 20, height: 20, borderRadius: 4 }} />
      <Text accessibilityRole="header" style={{ color: colors.TEXT, fontSize: 20, fontWeight: '700' }}>{title}</Text>
    </View>
  );
}
