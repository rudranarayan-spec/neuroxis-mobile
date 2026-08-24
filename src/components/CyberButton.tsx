import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface CyberButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  title,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      className={`w-full items-center justify-center rounded-xl bg-neon py-4 shadow-lg shadow-neon/30 ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#090D16" />
      ) : (
        <Text className="font-orbitron text-sm uppercase text-background">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};