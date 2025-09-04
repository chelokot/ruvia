import { View, Pressable, Text, Modal } from 'react-native';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as colors from '@/theme/colors';

type Option = { label: string; value: string };

type Props = {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
};

export default function ToggleSelector({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <View style={{ position: 'relative', zIndex: 1000 }}>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        onPress={() => {
          try {
            triggerRef.current?.measureInWindow?.((x, y, w, h) => {
              setAnchor({ x, y, w, h });
              setOpen(true);
            });
          } catch {
            setAnchor(null);
            setOpen(true);
          }
        }}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: '#111',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          minWidth: 140,
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: colors.PRIMARY }}>{current?.label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.PRIMARY} />
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        {/* Backdrop to close when tapping anywhere outside */}
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
        {/* Anchored dropdown */}
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', top: (anchor?.y ?? 120) + (anchor?.h ?? 40) + 8, left: anchor?.x ?? 16 }}
        >
          <View
            style={{
              width: (anchor?.w ?? 200),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#333',
              backgroundColor: '#0b0b0b',
              overflow: 'hidden',
            }}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => pick(o.value)}
                  style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: active ? 'rgba(0,229,255,0.08)' : 'transparent' }}
                >
                  <Text style={{ color: active ? colors.PRIMARY : '#ddd' }}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
