import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import * as colors from '@/theme/theme';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { sendFeedback } from '@/lib/api';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function ImageEditing() {
  const [suggestion, setSuggestion] = useState('');

  async function askNotify() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') Alert.alert('Notifications disabled');
    else Alert.alert('Thanks! We will notify you.');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Image Editing</Text>
        <Text style={{ color: '#bbb' }}>More image editing features are yet to be implemented.</Text>
        <PrimaryButton title="Notify me when available" onPress={askNotify} style={{ alignSelf: 'center', width: '70%' }} />
        <View style={{ gap: 8, width: '90%', maxWidth: 520, marginTop: 16 }}>
          <Text style={{ color: '#fff' }}>Tell us what features you’d like:</Text>
          <TextInput
            placeholder="Your suggestions"
            placeholderTextColor="#666"
            value={suggestion}
            onChangeText={setSuggestion}
            multiline
            numberOfLines={4}
            style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, borderColor: '#222', borderWidth: 1, minHeight: 100 }}
          />
          <PrimaryButton
            title="Send"
            disabled={!suggestion.trim()}
            onPress={async () => {
              const message = suggestion.trim();
              setSuggestion('');
              try {
                await sendFeedback(message);
                Alert.alert('Thank you!', 'Your suggestion has been sent.');
              } catch (e: any) {
                Alert.alert('Failed to send', e?.message ?? 'Unknown error');
              }
            }}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </View>
    </View>
  );
}
