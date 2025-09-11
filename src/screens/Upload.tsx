import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, Alert, ScrollView } from 'react-native';
import * as colors from '@/theme/theme';
import PrimaryButton from '@/components/ui/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getStyleRowsByKey } from '@/data/styles';
import { generateStyles } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const { user } = useAuth();

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
      const prompt = prompts.join('\n\n');
      // Navigate to a dedicated generating screen which will perform API call
      router.replace({ pathname: '/generating', params: { prompt, imgUri: imgUri! } });
    } catch (e: any) {
      Alert.alert('Generation failed', e.message ?? 'Please try again later');
    } finally {
      setLoading(false);
    }
  }

  const femaleExamples = useMemo(() => ({
    good: require('../../assets/examples/single/female/good.webp'),
    bad1: require('../../assets/examples/single/female/bad1.webp'),
    bad2: require('../../assets/examples/single/female/bad2.webp'),
  }), []);
  const maleExamples = useMemo(() => ({
    good: require('../../assets/examples/single/male/good.webp'),
    bad1: require('../../assets/examples/single/male/bad1.webp'),
    bad2: require('../../assets/examples/single/male/bad2.webp'),
  }), []);
  const examples = mode === 'single' && variant === 'male' ? maleExamples : femaleExamples;
  const [tile, setTile] = useState<number | null>(null);
  const GAP = 8;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Upload Photo</Text>
      </View>
      <Text style={{ color: '#bbb', marginBottom: 12 }}>
        {`Choose a clear headshot.\nGood lighting, single subject, neutral background.\nIdeally match your facial expression to the emotion you want in the results.`}
      </Text>
      <View
        style={{ flexDirection: 'row', gap: GAP, marginBottom: 12 }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          const size = Math.floor((w - 2 * GAP) / 3);
          if (size > 0) setTile(size);
        }}
      >
        {/* Good example */}
        <View style={{ width: tile ?? 0 }}>
          {tile ? (
            <>
              <Image
                source={examples.good}
                style={{ width: tile, height: tile, borderRadius: 10, borderWidth: 2, borderColor: '#10b981' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#10b981', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Good</Text>
            </>
          ) : null}
        </View>
        {/* Bad examples */}
        <View style={{ width: tile ?? 0 }}>
          {tile ? (
            <>
              <Image
                source={examples.bad1}
                style={{ width: tile, height: tile, borderRadius: 10, borderWidth: 2, borderColor: '#ef4444' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#ef4444', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Bad</Text>
            </>
          ) : null}
        </View>
        <View style={{ width: tile ?? 0 }}>
          {tile ? (
            <>
              <Image
                source={examples.bad2}
                style={{ width: tile, height: tile, borderRadius: 10, borderWidth: 2, borderColor: '#ef4444' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#ef4444', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Bad</Text>
            </>
          ) : null}
        </View>
      </View>
      <Text style={{ color: '#bbb', marginBottom: 12 }}>Restrictions: do not upload photos of others without permission, images of minors, or nudity.</Text>

      <View style={{ gap: 12, marginTop: 8 }}>
        <Pressable onPress={pickImage} accessibilityRole="button" style={{ backgroundColor: '#111', borderColor: '#222', borderWidth: 1, padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#fff' }}>{imgUri ? 'Change photo' : 'Select photo'}</Text>
        </Pressable>
        {imgUri && (
          <Image source={{ uri: imgUri }} style={{ width: '100%', height: 300, borderRadius: 12 }} resizeMode="cover" />
        )}
        <PrimaryButton title={loading ? 'Generating...' : 'Start generating'} onPress={startGenerating} disabled={!imgUri || loading} />
        <Text style={{ color: '#666', textAlign: 'center' }}>Results will be saved in the app folder automatically.</Text>
      </View>
    </ScrollView>
  );
}
