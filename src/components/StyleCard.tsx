import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StyleItem } from '@/data/styles';

type Props = {
  item: StyleItem;
  selected: boolean;
  onPress: () => void;
};

export default memo(function StyleCard({ item, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Style ${item.name}${selected ? ' selected' : ''}`}
      style={{ width: 120, marginRight: 12 }}
    >
      <View
        style={{
          height: 140,
          borderRadius: 12,
          backgroundColor: item.color,
          opacity: selected ? 0.6 : 1,
          justifyContent: 'flex-end',
          padding: 8,
        }}
      >
        {selected && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#00e5ff',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="checkmark" size={16} color="#000" />
          </View>
        )}
        <Text style={{ color: '#bbb', fontSize: 12 }} numberOfLines={1}>{item.name}</Text>
      </View>
    </Pressable>
  );
});

