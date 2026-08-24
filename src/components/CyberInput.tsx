import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface CyberInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const CyberInput: React.FC<CyberInputProps> = ({ label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4 w-full">
      <Text className="mb-1.5 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
        {label}
      </Text>
      <View
        className={`w-full flex-row items-center rounded-xl border bg-card px-4 py-3 ${
          error
            ? 'border-red-500'
            : isFocused
            ? 'border-neon shadow-sm shadow-neon'
            : 'border-cardBorder'
        }`}
      >
        <TextInput
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#4B5563"
          className="flex-1 font-rajdhani text-base text-white"
          {...props}
        />
      </View>
      {error && (
        <Text className="mt-1 font-rajdhani-bold text-xs text-red-500">{error}</Text>
      )}
    </View>
  );
};