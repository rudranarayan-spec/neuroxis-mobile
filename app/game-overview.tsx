import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { GuideModal } from '../src/components/GameModals';
import { GAME_CONFIGS } from '../src/config/gameConfigs';

export const GameOverviewScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ gameId?: string; title?: string; route?: string }>();

  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Dynamic config resolution with fallback to Sudoku
  const gameId = params.gameId || 'sudoku';
  const config = GAME_CONFIGS[gameId] ?? GAME_CONFIGS.sudoku;

  const handlePlayNow = () => {
    const targetRoute = params.route || `/${gameId}`;
    router.push(targetRoute as any);
  };

  return (
    <ScreenContainer className="flex-1 bg-[#101010] px-4 pt-2">
      <StatusBar barStyle="light-content" backgroundColor="#101010" />

      {/* HEADER */}
      <View className="mb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#1A1A1A] active:bg-[#252525]"
        >
          <Text className="font-orbitron-bold text-base text-text-main">←</Text>
        </TouchableOpacity>

        <View className="rounded-full border border-white/10 bg-[#1A1A1A] px-4 py-1.5">
          <Text className="font-orbitron-bold text-xs tracking-widest text-text-muted">
            MISSION LOBBY
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowGuideModal(true)}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#1A1A1A] active:bg-[#252525]"
        >
          <Text className="font-orbitron-bold text-base text-[#B5F23D]">ⓘ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* HERO CARD */}
        <View className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1A1A1A] p-6 shadow-2xl">
          <View className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#B5F23D]/10 blur-xl" />

          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-[#B5F23D]/30 bg-[#B5F23D]/10">
              <Text className="text-3xl">{config.icon}</Text>
            </View>

            <View className="flex-1">
              <Text className="font-orbitron-black text-2xl tracking-wide text-text-main">
                {params.title || config.title}
              </Text>
              <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-widest text-[#B5F23D]">
                {config.subtitle}
              </Text>
            </View>
          </View>

          <Text className="mt-4 font-rajdhani-medium text-sm leading-relaxed text-text-muted">
            {config.description}
          </Text>
        </View>

        {/* SPEED BONUS BADGE */}
        {config.speedReward && (
          <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-[#B5F23D]/30 bg-[#B5F23D]/5 px-5 py-3.5">
            <View className="flex-row items-center gap-3">
              <Text className="text-xl">⚡</Text>
              <View>
                <Text className="font-orbitron-bold text-xs text-text-main">SPEED RUN REWARD</Text>
                <Text className="font-rajdhani-medium text-xs text-text-muted">
                  Finish {config.speedReward.targetTimeFormatted}
                </Text>
              </View>
            </View>
            <View className="rounded-xl border border-[#B5F23D]/40 bg-[#B5F23D]/20 px-3 py-1">
              <Text className="font-orbitron-black text-xs text-[#B5F23D]">
                +{config.speedReward.bonusXp} EXTRA XP
              </Text>
            </View>
          </View>
        )}

        {/* METRICS GRID */}
        <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
          {config.metrics.map((metric, idx) => (
            <View key={idx} className="w-[48%] rounded-2xl border border-white/10 bg-[#1A1A1A] p-4">
              <Text className="font-rajdhani-bold text-[10px] tracking-widest text-text-muted">
                {metric.label}
              </Text>
              <Text className="mt-1 font-orbitron-black text-xl text-text-main">
                {metric.value}
              </Text>
            </View>
          ))}
        </View>

        {/* BRIEFING & TIPS */}
        {config.tacticalIntel.length > 0 && (
          <View className="mt-4 rounded-3xl border border-white/10 bg-[#1A1A1A] p-5">
            <View className="mb-3 flex-row items-center gap-2">
              <Text className="text-base">🎯</Text>
              <Text className="font-orbitron-bold text-xs tracking-wider text-text-main">
                TACTICAL INTEL
              </Text>
            </View>

            <View className="gap-2.5">
              {config.tacticalIntel.map((tip, idx) => (
                <View key={idx} className="flex-row items-start gap-2">
                  <Text className="text-[#B5F23D]">•</Text>
                  <Text className="flex-1 font-rajdhani-medium text-xs leading-5 text-text-muted">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FOOTER CALL TO ACTION */}
      <View className="mb-6 pt-2">
        <TouchableOpacity
          onPress={handlePlayNow}
          activeOpacity={0.8}
          className="items-center justify-center rounded-2xl bg-[#B5F23D] py-4 shadow-xl shadow-[#B5F23D]/20 active:bg-[#a2dc33]"
        >
          <Text className="font-orbitron-black text-base tracking-wider text-black">START</Text>
        </TouchableOpacity>
      </View>

      {/* DYNAMIC GUIDE MODAL */}
      <GuideModal
        gameId={gameId}
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </ScreenContainer>
  );
};

export default GameOverviewScreen;