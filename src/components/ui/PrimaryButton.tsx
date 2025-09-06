import React from 'react';
import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native';
import * as colors from '@/theme/theme';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({ title, onPress, disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={[{
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDisabled ? colors.PRIMARY_DIM : colors.PRIMARY,
        opacity: isDisabled ? 0.85 : 1,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={{ color: '#000', fontWeight: '700' }}>{title}</Text>
      )}
    </Pressable>
  );
}

