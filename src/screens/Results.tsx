import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, Pressable, Share, Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSessionCredits } from '@/lib/api';

export default function Results() {
  const router = useRouter();
  const { urls = '[]' } = useLocalSearchParams<{ urls: string }>();
  const list: string[] = JSON.parse(Array.isArray(urls) ? urls[0] : urls);

  async function saveImage(url: string) {
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = url; a.download = 'ruvia.png'; a.target = '_blank'; a.click();
      return;
    }
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Storage permission is required to save images.');
      return;
    }
    const fileUri = `${FileSystem.documentDirectory}ruvia/result-${Date.now()}.png`;
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}ruvia/`, { intermediates: true }).catch(() => {});
    const res = await FileSystem.downloadAsync(url, fileUri);
    await MediaLibrary.saveToLibraryAsync(res.uri);
    Alert.alert('Saved', 'Image saved to your photos');
  }

  async function shareImage(url: string) {
    try {
      await Share.share({ url, message: 'Check out my AI photo from Ruvia!' });
    } catch {}
  }

  // Back button in header; on back, optionally check credits and route to purchase if 0
  const { user } = useAuth();
  async function onBack() {
    try {
      const idToken = await user?.getIdToken?.();
      if (idToken) {
        const credits = await getSessionCredits(idToken);
        if (credits <= 0) {
          router.replace('/purchase');
          return;
        }
      }
    } catch {}
    router.replace('/(tabs)');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#111', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Your Results</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {list.map((uri, i) => (
          <ResultItem key={i} uri={uri} onSave={() => saveImage(uri)} onShare={() => shareImage(uri)} />
        ))}
      </ScrollView>
    </View>
  );
}

import { useState } from 'react';
type ItemProps = { uri: string; onSave: () => void; onShare: () => void };
function ResultItem({ uri, onSave, onShare }: ItemProps) {
  const [w, setW] = useState<number>(0);
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    Image.getSize(
      uri,
      (iw, ih) => setRatio(ih > 0 ? iw / ih : 1),
      () => setRatio(1),
    );
  }, [uri]);

  const height = ratio && w ? Math.round(w / ratio) : 320;

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}
    >
      <Image source={{ uri }} style={{ width: '100%', height }} resizeMode="cover" />
      {/* Overlay icons */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 8, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable onPress={onSave} accessibilityRole="button" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="download-outline" size={20} color="#fff" />
        </Pressable>
        <Pressable onPress={onShare} accessibilityRole="button" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
