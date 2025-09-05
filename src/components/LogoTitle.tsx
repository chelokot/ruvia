import { View, Text, Image } from 'react-native';
import * as colors from '@/theme/theme';

export default function LogoTitle({ title = 'Ruvia' }: { title?: string }) {
  const text = typeof title === 'string' && title.length > 0 ? title.slice(1) : title;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image source={require('../../assets/icon.png')} style={{ width: 20, height: 20, borderRadius: 4 }} />
      <Text accessibilityRole="header" style={{ color: colors.TEXT, fontSize: 20, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}
