import { View, Pressable, Text, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type Option = { label: string; value: string };

type Props = {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
};

export default function ToggleSelector({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <View style={{ position: 'relative', zIndex: 1000 }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((s) => !s)}
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
        <Text style={{ color: '#00e5ff' }}>{current?.label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#00e5ff" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setOpen(false)}>
          {/* Empty to capture outside presses */}
        </Pressable>
        <View style={{ position: 'absolute', top: 120, left: 16, right: 16 }}>
          <View
            style={{
              marginHorizontal: 'auto' as any,
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
                  <Text style={{ color: active ? '#00e5ff' : '#ddd' }}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
