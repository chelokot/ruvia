import { View, Pressable, Text } from 'react-native';

type Option = { label: string; value: string };

type Props = {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
};

export default function ToggleSelector({ value, options, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? '#00e5ff' : '#333',
              backgroundColor: active ? 'rgba(0,229,255,0.12)' : '#111',
            }}
          >
            <Text style={{ color: '#00e5ff' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

