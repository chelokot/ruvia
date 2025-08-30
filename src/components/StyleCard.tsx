import { memo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
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
      <View style={{ height: 140 }}>
        <Image
          source={item.image}
          style={{ width: '100%', height: '100%', borderRadius: 12, opacity: selected ? 0.6 : 1 }}
          resizeMode="cover"
        />
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
      </View>
      <Text style={{ color: '#bbb', fontSize: 12, marginTop: 8, textAlign: 'center' }} numberOfLines={2}>
        {item.name}
      </Text>
    </Pressable>
  );
});
