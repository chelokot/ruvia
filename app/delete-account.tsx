import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import TextField from '@/components/ui/TextField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import * as colors from '@/theme/theme';
import { getApiBase } from '@/lib/runtime';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE = getApiBase();

  async function submit() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || 'Request failed');
      Alert.alert('Request received', 'We will process the deletion shortly.');
    } catch (e: any) {
      Alert.alert('Could not submit', e?.message ?? 'Please try again later');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 56, paddingHorizontal: 16 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 }}>Delete Account</Text>
      <Text style={{ color: '#bbb', marginBottom: 12 }}>
        Enter the email associated with the account you want deleted. We will queue a deletion request and process it promptly.
      </Text>
      <View style={{ gap: 12, maxWidth: 520 }}>
        <TextField placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <PrimaryButton title={loading ? 'Submitting…' : 'Submit deletion'} onPress={submit} disabled={!email.trim() || loading} />
        <Text style={{ color: colors.MUTED, fontSize: 12 }}>
          Note: This page is intended for external requests and does not require signing in.
        </Text>
      </View>
    </View>
  );
}

