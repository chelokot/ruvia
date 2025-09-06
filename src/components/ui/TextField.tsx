import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  error?: boolean;
};

export default function TextField({ error, style, ...rest }: Props) {
  return (
    <View style={{ height: 48 }}>
      <TextInput
        {...rest}
        style={[{
          height: 48,
          backgroundColor: '#111',
          color: '#fff',
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : '#222',
        }, style as any]}
        placeholderTextColor="#666"
      />
    </View>
  );
}

