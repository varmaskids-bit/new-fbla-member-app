import React from 'react';
import { Text } from 'react-native';

type Props = {
  size?: number | string;
  color?: string;
  weight?: '400'|'500'|'600'|'700'|'800';
  style?: any;
  children?: React.ReactNode;
};

export default function ThemedText({ size = 16, color = 'white', weight = '500', style, children }: Props) {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 16;
  return <Text style={[{ color, fontSize: numericSize, fontWeight: weight }, style]}>{children}</Text>;
}
