import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Animated, Easing, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { generateStyles } from '@/lib/api';

export default function Generating() {
  const router = useRouter();
  const { prompt = '', imgUri = '' } = useLocalSearchParams<{ prompt?: string; imgUri?: string }>();
  const { user, userDoc, setNotNew } = useAuth();
  const [status, setStatus] = useState('Preparing...');
  const [error, setError] = useState<string | null>(null);

  // Simple progress bar
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 24000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
  }, [progress]);

  // Rotating statuses
  useEffect(() => {
    const steps = ['Uploading image', 'Composing prompt', 'Generating magic', 'Polishing results'];
    let i = 0;
    setStatus(steps[i]);
    const t = setInterval(() => {
      i = (i + 1) % steps.length;
      setStatus(steps[i]);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  useEffect(() => {
    (async () => {
      try {
        const idToken = await user?.getIdToken?.();
        if (!idToken) throw new Error('Not authenticated');
        const resp = await generateStyles({ prompt: String(prompt), imageUri: String(imgUri), idToken });
        if (!resp.ok || !resp.data) throw new Error(resp.error || 'Failed');
        const urls = resp.data.images.map((i) => i.url);
        // Mark user as not new after first successful generation
        if (userDoc?.isNew) {
          try { await setNotNew(); } catch {}
        }
        // On web we can keep URLs and let user save/share; on native too
        router.replace({ pathname: '/results', params: { urls: JSON.stringify(urls) } });
      } catch (e: any) {
        setError(e.message ?? 'Generation failed');
      }
    })();
  }, [prompt, imgUri, router, user]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 80, paddingHorizontal: 16 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 }}>Generating</Text>
      <Text style={{ color: '#bbb', marginBottom: 16 }}>{status}</Text>

      <View style={{ height: 10, backgroundColor: '#111', borderRadius: 999, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', width: barWidth, backgroundColor: '#00e5ff' }} />
      </View>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <ActivityIndicator size="large" color="#00e5ff" />
      </View>

      {error && (
        <Text style={{ color: '#f43f5e', marginTop: 16 }}>{error}</Text>
      )}
    </View>
  );
}
