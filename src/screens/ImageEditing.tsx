import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { sendFeedback } from '@/lib/api';

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
        <Pressable accessibilityRole="button" onPress={askNotify} style={{ backgroundColor: '#00e5ff', padding: 14, borderRadius: 12, alignSelf: 'center' }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Notify me when available</Text>
        </Pressable>
        <View style={{ gap: 8, width: '90%', maxWidth: 520 }}>
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
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              try {
                await sendFeedback(suggestion.trim());
                setSuggestion('');
                Alert.alert('Thank you!', 'Your suggestion has been sent.');
              } catch (e: any) {
                Alert.alert('Failed to send', e?.message ?? 'Unknown error');
              }
            }}
            style={{ backgroundColor: '#00e5ff', padding: 12, borderRadius: 10, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: '#000', fontWeight: '700' }}>Send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
