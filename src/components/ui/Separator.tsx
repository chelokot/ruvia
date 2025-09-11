import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  text: string;
};

// A horizontally centered label between two hairlines.
// Uses includeFontPadding: false to vertically center lowercase text better on Android.
export default function Separator({ text }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
      <Text style={{ color: '#555', includeFontPadding: false as any, lineHeight: 16, fontSize: 14 }}>{text}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
    </View>
  );
}

