import { View, Text, ScrollView } from 'react-native';
import type { StyleRow as Row, StyleItem } from '@/data/styles';
import StyleCard from './StyleCard';

type Props = {
  row: Row;
  selectedIds: Set<string>;
  onToggle: (item: StyleItem) => void;
};

export default function StyleRow({ row, selectedIds, onToggle }: Props) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{row.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {row.items.map((item) => (
          <StyleCard
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onPress={() => onToggle(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

