import React from 'react';
import { View, Text, Pressable, Linking, ScrollView, Image } from 'react-native';
import LogoTitle from '@/components/LogoTitle';
import PrimaryButton from '@/components/ui/PrimaryButton';
import * as colors from '@/theme/theme';

export default function Landing() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ paddingVertical: 48 }}>
      <View style={{ maxWidth: 1000, width: '100%', alignSelf: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <LogoTitle title="Ruvia" />
          <Text style={{ color: '#bbb', textAlign: 'center' }}>AI‑powered, identity‑true profile pictures. Beautiful, fast, private.</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Image source={require('../assets/register/row1/img01.webp')} style={{ width: 220, height: 220, borderRadius: 16 }} />
          <Image source={require('../assets/register/row2/img02.webp')} style={{ width: 220, height: 220, borderRadius: 16 }} />
          <Image source={require('../assets/register/row3/img03.webp')} style={{ width: 220, height: 220, borderRadius: 16 }} />
        </View>

        <View style={{ alignItems: 'center', gap: 16 }}>
          <PrimaryButton title="Get the app" onPress={() => Linking.openURL('https://ruvia.art')} style={{ width: 220 }} />
          <Text style={{ color: colors.MUTED }}>
            Questions? <Text style={{ color: colors.PRIMARY, textDecorationLine: 'underline' }} onPress={() => Linking.openURL('mailto:support@ruvia.art')}>support@ruvia.art</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable onPress={() => Linking.openURL('/terms')}><Text style={{ color: colors.MUTED, textDecorationLine: 'underline' }}>Terms</Text></Pressable>
            <Pressable onPress={() => Linking.openURL('/privacy')}><Text style={{ color: colors.MUTED, textDecorationLine: 'underline' }}>Privacy</Text></Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

