import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getStyleRowsByKey } from '@/data/styles';
import { generateStyles } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function Upload() {
  const router = useRouter();
  const { ids = '', ds } = useLocalSearchParams<{ ids: string; ds?: string }>();
  const idSet = useMemo(() => new Set((ids as string).split(',').filter(Boolean)), [ids]);
  const { mode, variant } = useMemo(() => {
    const key = (ds ?? '').toString();
    if (key.startsWith('Single/')) {
      const v = key.split('/')[1] ?? 'Female';
      return { mode: 'single' as const, variant: v.toLowerCase() };
    }
    if (key.startsWith('Dual/')) {
      const v = key.split('/')[1] ?? 'Female+Male';
      return { mode: 'dual' as const, variant: v };
    }
    return { mode: 'single' as const, variant: 'female' };
  }, [ds]);

  const prompts = useMemo(() => {
    const arr: string[] = [];
    const rows = getStyleRowsByKey(ds);
    rows.forEach((r) => r.items.forEach((i) => { if (idSet.has(i.id)) arr.push(i.prompt); }));
    return arr;
  }, [idSet]);
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { userDoc, setNotNew } = useAuth();

  useEffect(() => {
    if (userDoc?.isNew) setNotNew().catch(() => {});
  }, [userDoc?.isNew]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.9 });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImgUri(asset.uri);
      setImgBase64(asset.base64 ?? null);
    }
  }

  async function startGenerating() {
    if (!imgBase64) return;
    setLoading(true);
    try {
      const { results } = await generateStyles({ imageBase64: imgBase64, prompts, mode, variant });
      // Save results to device and navigate
      const savedUris: string[] = [];
      for (let i = 0; i < results.length; i++) {
        const b64 = results[i];
        const fileUri = `${FileSystem.documentDirectory}ruvia/result-${Date.now()}-${i}.png`;
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}ruvia/`, { intermediates: true }).catch(() => {});
        await FileSystem.writeAsStringAsync(fileUri, b64, { encoding: FileSystem.EncodingType.Base64 });
        savedUris.push(fileUri);
        if (Platform.OS === 'web') {
          const a = document.createElement('a');
          a.href = `data:image/png;base64,${b64}`;
          a.download = `ruvia-${i + 1}.png`;
          a.click();
        }
      }
      router.replace({ pathname: '/results', params: { uris: JSON.stringify(savedUris) } });
    } catch (e: any) {
      Alert.alert('Generation failed', e.message ?? 'Please try again later');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Upload Photo</Text>
      <Text style={{ color: '#bbb', marginBottom: 12 }}>Choose a clear headshot. Good lighting, single subject, neutral background.</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <View style={{ width: 60, height: 60, backgroundColor: '#10b981', borderRadius: 8 }} />
        <View style={{ width: 60, height: 60, backgroundColor: '#ef4444', borderRadius: 8 }} />
        <View style={{ width: 60, height: 60, backgroundColor: '#ef4444', borderRadius: 8 }} />
      </View>
      <Text style={{ color: '#bbb', marginBottom: 12 }}>Restrictions: do not upload photos of others without permission, images of minors, or nudity.</Text>

      <View style={{ gap: 12, marginTop: 8 }}>
        <Pressable onPress={pickImage} accessibilityRole="button" style={{ backgroundColor: '#111', borderColor: '#222', borderWidth: 1, padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#fff' }}>{imgUri ? 'Change photo' : 'Select photo'}</Text>
        </Pressable>
        {imgUri && (
          <Image source={{ uri: imgUri }} style={{ width: '100%', height: 300, borderRadius: 12 }} resizeMode="cover" />
        )}
        <Pressable disabled={!imgUri || loading} onPress={startGenerating} accessibilityRole="button" style={{ opacity: !imgUri || loading ? 0.6 : 1, backgroundColor: '#00e5ff', padding: 14, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>{loading ? 'Generating...' : 'Start generating'}</Text>
        </Pressable>
        <Text style={{ color: '#666', textAlign: 'center' }}>Results will be saved in the app folder automatically.</Text>
      </View>
    </ScrollView>
  );
}
