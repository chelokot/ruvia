import { View, Text, Pressable } from 'react-native';

type Props = {
  count: number;
  balance: number;
  onReset: () => void;
  onContinue: () => void;
  onBuy: () => void;
};

export default function BottomSelectionBar({ count, balance, onReset, onContinue, onBuy }: Props) {
  const over = count > balance;
  const message = over
    ? `You selected ${count} and only have ${balance} available`
    : `You can select several styles and generate in batch`;
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        backgroundColor: '#111',
        borderTopColor: '#222',
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Text style={{ color: over ? '#f59e0b' : '#bbb', position: 'absolute', top: 8, left: 12, right: 12, textAlign: 'center' }}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onReset}
        style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#222', borderRadius: 10 }}
      >
        <Text style={{ color: '#fff' }}>Reset</Text>
      </Pressable>
      <View style={{ flex: 1 }} />
      <Pressable
        accessibilityRole="button"
        onPress={over ? onBuy : onContinue}
        style={{ paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#00e5ff', borderRadius: 10 }}
      >
        <Text style={{ color: '#000', fontWeight: '700' }}>{over ? 'Buy more' : `Continue with ${count} style${count > 1 ? 's' : ''}`}</Text>
      </Pressable>
    </View>
  );
}

