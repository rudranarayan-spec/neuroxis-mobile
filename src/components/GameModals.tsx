import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GAME_CONFIGS, GameConfig, RuleItem } from '../config/gameConfigs';

const DEFAULT_FALLBACK_CONFIG: GameConfig = {
  id: 'default',
  title: 'PUZZLE',
  subtitle: 'CHALLENGE',
  icon: '🧩',
  description: 'Complete the grid objective to finish the mission.',
  tagline: 'Puzzle completed successfully.',
  baseXp: 50,
  metrics: [],
  tacticalIntel: [],
  rules: ['Complete all grid conditions to solve the puzzle.'],
};

export interface SuccessModalProps {
  visible: boolean;
  gameId: string;
  timeFormatted: string;
  xpEarned: number;
  stats?: { label: string; value: string | number }[];
  onPlayAgain: () => void;
  onExit: () => void;
}

export interface ExitModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export interface GuideModalProps {
  visible: boolean;
  gameId: string;
  onClose: () => void;
}

// -----------------------------------------------------------------------------
// 1. SUCCESS / SOLVED MODAL
// -----------------------------------------------------------------------------
export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  gameId,
  timeFormatted,
  xpEarned,
  stats = [],
  onPlayAgain,
  onExit,
}) => {
  const config = GAME_CONFIGS[gameId] ?? DEFAULT_FALLBACK_CONFIG;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        <View className="w-full max-w-sm rounded-2xl border-2 border-gray-700 bg-[#1A1A1A] p-6">
          <Text className="font-orbitron-black text-center text-2xl text-accentGreen">
            {config.title.toUpperCase()} SOLVED!
          </Text>
          <Text className="mt-2 text-center font-rajdhani-medium text-sm text-text-muted">
            {config.tagline}
          </Text>

          <View className="my-6 rounded-xl border border-cardBorder bg-card p-4">
            <View className="mb-2 flex-row justify-between">
              <Text className="font-rajdhani-bold text-text-muted">TIME TAKEN</Text>
              <Text className="font-orbitron-bold text-accentGreen">{timeFormatted}</Text>
            </View>

            {stats.map((stat, idx) => (
              <View key={idx} className="mb-2 flex-row justify-between">
                <Text className="font-rajdhani-bold text-text-muted">
                  {stat.label.toUpperCase()}
                </Text>
                <Text className="font-orbitron-bold text-text-main">{stat.value}</Text>
              </View>
            ))}

            <View className="flex-row justify-between">
              <Text className="font-rajdhani-bold text-text-muted">XP GAINED</Text>
              <Text className="font-orbitron-bold text-accentGreen">+{xpEarned} XP</Text>
            </View>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={onPlayAgain}
              className="items-center justify-center rounded-xl bg-accentGreen py-3.5"
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
};

// -----------------------------------------------------------------------------
// 2. EXIT CONFIRMATION MODAL
// -----------------------------------------------------------------------------
export const ExitModal: React.FC<ExitModalProps> = ({
  visible,
  title = 'ABORT CURRENT PROGRESS?',
  message = 'Your current puzzle progress and timer will be lost if you leave now.',
  onCancel,
  onConfirmExit,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center bg-black/80 px-6">
      <View className="w-full max-w-sm rounded-2xl border border-cardBorder bg-[#1A1A1A] p-6">
        <Text className="font-rajdhani-bold text-xl text-text-main">{title}</Text>
        <Text className="mt-2 font-rajdhani-medium text-sm text-text-muted">{message}</Text>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 items-center justify-center rounded-xl border border-cardBorder bg-card py-3"
          >
            <Text className="font-orbitron-bold text-xs text-text-main">RESUME</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirmExit}
            className="flex-1 items-center justify-center rounded-xl border border-red-500 bg-red-500/20 py-3"
          >
            <Text className="font-orbitron-bold text-xs text-red-500">QUIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// -----------------------------------------------------------------------------
// 3. DYNAMIC GUIDE / HOW TO PLAY MODAL
// -----------------------------------------------------------------------------
export const GuideModal: React.FC<GuideModalProps> = ({ visible, gameId, onClose }) => {
  const config = GAME_CONFIGS[gameId] ?? DEFAULT_FALLBACK_CONFIG;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/80">
        <View className="max-h-[80%] rounded-t-3xl border-t-2 border-accentGreen bg-[#1A1A1A] p-6">
          <View className="flex-row items-center justify-between border-b border-cardBorder pb-4">
            <Text className="font-orbitron-black text-lg text-accentGreen">
              HOW TO PLAY {config.title.toUpperCase()}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="font-orbitron-bold text-lg text-text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="my-4">
            <Text className="mb-2 font-rajdhani-bold text-base text-text-main">Rules:</Text>
            <View className="gap-2">
              {config.rules.map((rule: RuleItem, idx: number) => {
                if (typeof rule === 'object' && rule !== null) {
                  return (
                    <View key={idx}>
                      {rule.title && (
                        <Text className="font-rajdhani-bold text-sm text-accentGreen">
                          {rule.title}
                        </Text>
                      )}
                      <Text className="font-rajdhani-medium text-sm text-text-muted">
                        • {rule.description}
                      </Text>
                    </View>
                  );
                }

                return (
                  <Text key={idx} className="font-rajdhani-medium text-sm text-text-muted">
                    • {rule}
                  </Text>
                );
              })}
            </View>

            {config.controlsGuide && (
              <View className="mt-4 rounded-xl border border-cardBorder bg-card p-3">
                <Text className="mb-1 font-rajdhani-bold text-xs text-accentGreen">
                  CONTROLS GUIDE
                </Text>
                <Text className="font-rajdhani-medium text-xs text-text-muted">
                  {config.controlsGuide}
                </Text>
              </View>
            )}
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
};