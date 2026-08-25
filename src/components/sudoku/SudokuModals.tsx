import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  timeFormatted: string;
  xpEarned: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

interface ExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
}

// 1. SUCCESS / SOLVED MODAL
export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  timeFormatted,
  xpEarned,
  onPlayAgain,
  onExit,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center bg-black/80 px-6">
      <View className="w-full max-w-sm rounded-2xl border-2 border-gray-700 bg-[#1A1A1A] p-6 text-center">
        <Text className="font-orbitron-black text-center text-2xl text-accentGreen">
          SUDOKU SOLVED!
        </Text>
        <Text className="mt-2 text-center font-rajdhani-medium text-sm text-text-muted">
          Decryption sequence verified successfully.
        </Text>

        <View className="my-6 rounded-xl border border-cardBorder bg-card p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="font-rajdhani-bold text-text-muted">TIME TAKEN</Text>
            <Text className="font-orbitron-bold text-accentGreen">{timeFormatted}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-rajdhani-bold text-text-muted">XP GAINED</Text>
            <Text className="font-orbitron-bold text-accentGreen">+{xpEarned} XP</Text>
          </View>
        </View>

        <View className="gap-3">
          <TouchableOpacity
            onPress={onPlayAgain}
            className="items-center justify-center rounded-xl bg-gray-400 py-3.5"
          >
            <Text className="font-orbitron-black text-sm text-black">PLAY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onExit}
            className="items-center justify-center rounded-xl border border-cardBorder bg-card py-3.5"
          >
            <Text className="font-orbitron-bold text-sm text-text-main">EXIT TO MENU</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// 2. EXIT CONFIRMATION MODAL
export const ExitModal: React.FC<ExitModalProps> = ({
  visible,
  onCancel,
  onConfirmExit,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center bg-black/80 px-6">
      <View className="w-full max-w-sm rounded-2xl border border-cardBorder bg-[#1A1A1A] p-6">
        <Text className="font-rajdhani text-xl text-text-main">ABORT CURRENT PROGRESS?</Text>
        <Text className="mt-2 font-rajdhani-medium text-sm text-text-muted">
          Your current puzzle progress and timer will be lost if you leave now.
        </Text>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 items-center justify-center rounded-xl border border-cardBorder bg-card py-3"
          >
            <Text className="font-orbitron-bold text-xs text-text-main">RESUME</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirmExit}
            className="flex-1 items-center justify-center rounded-xl bg-red-500/20 border border-red-500 py-3"
          >
            <Text className="font-orbitron-bold text-xs text-red-500">QUIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// 3. HOW TO PLAY / GUIDE MODAL
export const GuideModal: React.FC<GuideModalProps> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 justify-end bg-black/80">
      <View className="max-h-[80%] rounded-t-3xl border-t-2 border-accentGreen bg-[#1A1A1A] p-6">
        <View className="flex-row items-center justify-between pb-4 border-b border-cardBorder">
          <Text className="font-orbitron-black text-lg text-accentGreen">HOW TO PLAY</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="font-orbitron-bold text-lg text-text-muted">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="my-4">
          <Text className="font-rajdhani-bold text-base text-text-main mb-2">6x6 Matrix Rules:</Text>
          <View className="gap-2 text-text-muted font-rajdhani-medium text-sm">
            <Text className="text-text-muted">• Fill the grid so every row contains numbers 1 to 6 without duplicates.</Text>
            <Text className="text-text-muted">• Every column must also contain numbers 1 to 6 with no repeats.</Text>
            <Text className="text-text-muted">• Each 2x3 box outlined in green must contain digits 1 through 6.</Text>
            <Text className="text-text-muted">• Tap an empty cell, then select a number from the keypad below.</Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={onClose}
          className="items-center justify-center rounded-xl bg-accentGreen py-3.5"
        >
          <Text className="font-orbitron-black text-sm text-black">UNDERSTOOD</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);