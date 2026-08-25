import React from 'react';
import { View, Text } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { COLORS } from '../constants/theme';

export const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <View
      className="w-[90%] max-w-md flex-row items-center rounded-xl border p-4 shadow-lg"
      style={{
        backgroundColor: COLORS.card,
        borderColor: COLORS.primary,
      }}
    >
      <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
      <View className="flex-1">
        {text1 ? (
          <Text className="font-orbitron text-xs font-bold uppercase" style={{ color: COLORS.primary }}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text className="mt-0.5 font-rajdhani text-sm font-semibold" style={{ color: COLORS.textMain }}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: BaseToastProps) => (
    <View
      className="w-[90%] max-w-md flex-row items-center rounded-xl border p-4 shadow-lg"
      style={{
        backgroundColor: COLORS.card,
        borderColor: COLORS.danger,
      }}
    >
      <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.danger }} />
      <View className="flex-1">
        {text1 ? (
          <Text className="font-orbitron text-xs font-bold uppercase" style={{ color: COLORS.danger }}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text className="mt-0.5 font-rajdhani text-sm font-semibold" style={{ color: COLORS.textMain }}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),
};

export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 50,
    });
  },
};