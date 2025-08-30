import { View, Text, Pressable, ScrollView } from 'react-native';
import LogoTitle from '@/components/LogoTitle';
import ToggleSelector from '@/components/ToggleSelector';
import { useMemo, useState } from 'react';
import { getStyleRowsByKey, StyleItem } from '@/data/styles';
import StyleRow from '@/components/StyleRow';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'single' | 'dual';

export default function ProfilePictures() {
  const router = useRouter();
  const { userDoc } = useAuth();
  const balance = userDoc?.balance ?? 0;
  // Default to true while userDoc is loading/absent to ensure single-flow UX
  const isNew = userDoc?.isNew ?? true;
  const [mode, setMode] = useState<Mode>('single');
  const [secondary, setSecondary] = useState('female');
  const secondaryOptions = useMemo(() => {
    if (mode === 'dual') return [
      { label: 'Female+Male', value: 'f+m' },
      { label: 'Female+Female', value: 'f+f' },
      { label: 'Male+Male', value: 'm+m' },
      { label: 'Other+Other', value: 'o+o' },
    ];
    return [
      { label: 'Female', value: 'female' },
      { label: 'Male', value: 'male' },
      { label: 'Other', value: 'other' },
    ];
  }, [mode]);

  function toDatasetKey() {
    if (mode === 'single') {
      const v = secondary === 'female' ? 'Female' : secondary === 'male' ? 'Male' : 'Other';
      return `Single/${v}`;
    }
    // dual variants use short codes like f+m, f+f, m+m, o+o
    const map: Record<string, string> = {
      'f+m': 'Female+Male',
      'f+f': 'Female+Female',
      'm+m': 'Male+Male',
      'o+o': 'Other+Other',
    };
    const v = map[secondary] ?? 'Female+Male';
    return `Dual/${v}`;
  }

  const datasetKey = toDatasetKey();
  const rows = getStyleRowsByKey(datasetKey);

  const [selected, setSelected] = useState<Record<string, StyleItem>>({});
  const selectedCount = Object.keys(selected).length;

  function toggle(item: StyleItem) {
    if (isNew && selectedCount === 0) {
      router.push({ pathname: '/upload', params: { ids: item.id, ds: datasetKey } });
      return;
    }
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });
  }

  function reset() {
    setSelected({});
  }

  function continueFlow() {
    const ids = Object.keys(selected).join(',');
    router.push({ pathname: '/upload', params: { ids, ds: datasetKey } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, borderBottomColor: '#111', borderBottomWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LogoTitle />
          <View style={{ flex: 1 }} />
          <Pressable accessibilityRole="button" onPress={() => router.push('/purchase')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Balance: {balance}</Text>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#00e5ff', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="add" size={16} color="#000" />
            </View>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <ToggleSelector value={mode} onChange={(v) => setMode(v as Mode)} options={[{ label: 'Single', value: 'single' }, { label: 'Dual', value: 'dual' }]} />
          <ToggleSelector value={secondary} onChange={setSecondary} options={secondaryOptions} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {rows.map((row) => (
          <StyleRow key={row.id} row={row} selectedIds={new Set(Object.keys(selected))} onToggle={toggle} />)
        )}
      </ScrollView>

      {selectedCount > 0 && !isNew && (
        // Inline to avoid import loop w/ web SSR
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          {/* @ts-ignore */}
          {require('@/components/BottomSelectionBar').default({
            count: selectedCount,
            balance,
            onReset: reset,
            onContinue: continueFlow,
            onBuy: () => router.push('/purchase'),
          })}
        </View>
      )}
    </View>
  );
}
