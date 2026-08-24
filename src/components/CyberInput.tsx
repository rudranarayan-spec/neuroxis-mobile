import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface CyberInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const CyberInput: React.FC<CyberInputProps> = ({ label, error, style, ...props }) => {
  return (
    <View className="mb-4 w-full">
      <Text className="mb-1.5 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#8E8E93"
        style={style}
        className={`w-full rounded-xl border bg-card px-4 py-3.5 font-rajdhani text-sm text-text-main ${
          error ? 'border-red-500' : 'border-cardBorder focus:border-accentGreen'
        }`}
        {...props}
      />
      {error && <Text className="mt-1 font-rajdhani text-xs text-red-500">{error}</Text>}
    </View>
  );
};