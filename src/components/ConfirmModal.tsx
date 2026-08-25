import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../constants/theme';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

interface ConfirmModalProps {
  visible: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  options,
  onConfirm,
  onCancel,
}) => {
  const {
    title,
    message,
    confirmText = 'CONFIRM',
    cancelText = 'CANCEL',
    isDanger = false,
  } = options;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <TouchableWithoutFeedback>
            <View
              className="w-full max-w-md rounded-2xl border p-6"
              style={{
                backgroundColor: COLORS.card,
                borderColor: COLORS.cardBorder,
              }}
            >
              {/* Header Badge & Title */}
              <Text
                className="font-rajdhani-bold text-xs uppercase tracking-[0.25em]"
                style={{ color: isDanger ? COLORS.danger : COLORS.primary }}
              >
                {isDanger ? 'WARNING_ACTION' : 'ACTION_REQUIRED'}
              </Text>
              
              <Text className="mt-1 font-orbitron-black text-xl font-bold" style={{ color: COLORS.textMain }}>
                {title}
              </Text>

              {/* Message Description */}
              <Text className="mt-2 font-rajdhani text-sm" style={{ color: COLORS.textMuted }}>
                {message}
              </Text>

              {/* Action Buttons */}
              <View className="mt-6 flex-row gap-3">
                <TouchableOpacity
                  onPress={onCancel}
                  className="flex-1 items-center justify-center rounded-xl border py-3 active:opacity-80"
                  style={{ borderColor: COLORS.cardBorder, backgroundColor: COLORS.inputBg }}
                >
                  <Text className="font-orbitron text-xs font-bold uppercase" style={{ color: COLORS.textMuted }}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  className="flex-1 items-center justify-center rounded-xl py-3 active:opacity-90"
                  style={{ backgroundColor: isDanger ? COLORS.danger : COLORS.primary }}
                >
                  <Text className="font-orbitron text-xs font-bold uppercase" style={{ color: COLORS.background }}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};