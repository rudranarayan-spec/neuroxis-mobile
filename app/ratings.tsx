import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../src/components/ScreenContainer';

export default function RatingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('7 DAYS');

  const filterTabs = ['ALL TIME', 'TODAY', '7 DAYS', '30 DAYS', '90 DAYS'];

  return (
    <ScreenContainer className="bg-background px-4">
      {/* 1. TOP NAVBAR */}
      <View className="mb-5 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-card border border-cardBorder"
        >
          <Text className="text-lg text-white">←</Text>
        </TouchableOpacity>
        <Text className="font-rajdhani-bold text-xl text-white">Ratings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 2. PILL FILTER TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 flex-row gap-2"
        >
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 border ${
                  isActive
                    ? 'border-accentGreen bg-accentGreen/10'
                    : 'border-cardBorder bg-card'
                }`}
              >
                <Text
                  className={`font-rajdhani-bold text-xs ${
                    isActive ? 'text-accentGreen' : 'text-text-muted'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. GAME MODES GRID */}
        <View className="mb-6 flex-row flex-wrap justify-between gap-3">
          {/* MATH CARD */}
          <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-orbitron-black text-2xl text-white">2346</Text>
            </View>
            <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              MATH
            </Text>
            <Text className="mt-3 text-xs text-text-muted">0</Text>
          </View>

          {/* CLASSIC CARD */}
          <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-orbitron-black text-2xl text-white">1693</Text>
              <Text className="text-sm">👑</Text>
            </View>
            <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              CLASSIC
            </Text>
            <Text className="mt-3 text-xs text-text-muted">0</Text>
          </View>

          {/* MEMORY CARD */}
          <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-orbitron-black text-2xl text-white">2006</Text>
              <Text className="text-sm">🧠</Text>
            </View>
            <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              MEMORY
            </Text>
            <Text className="mt-3 text-xs text-text-muted">0</Text>
          </View>

          {/* PUZZLE CARD (ACTIVE HIGHLIGHT) */}
          <View className="w-[48%] rounded-2xl border border-accentGreen/50 bg-gradient-to-br from-card to-accentGreen/10 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-orbitron-black text-2xl text-white">2916</Text>
              <View className="h-6 w-6 items-center justify-center rounded-lg bg-badge-purple/20">
                <Text className="text-xs">🧩</Text>
              </View>
            </View>
            <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              PUZZLE
            </Text>
            <Text className="mt-3 font-rajdhani-bold text-xs text-accentGreen">592 ↑</Text>
          </View>
        </View>

        {/* 4. STATS OVERVIEW SECTION */}
        <Text className="mb-3 font-rajdhani-bold text-base text-white">Stats Overview</Text>

        <View className="mb-6 flex-row flex-wrap justify-between gap-3">
          {/* GAMES PLAYED */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-white">242</Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">GAMES PLAYED</Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-badge-purple/20">
              <Text className="text-base">🎮</Text>
            </View>
          </View>

          {/* XP GAINED */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-white">930</Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">XP GAINED</Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-badge-green/20">
              <Text className="text-base">⚡</Text>
            </View>
          </View>

          {/* PEAK RATING */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-white">2916</Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">PEAK RATING</Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-badge-teal/20">
              <Text className="text-base">🚩</Text>
            </View>
          </View>

          {/* WIN : LOSS */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-white">143 : 99</Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">WIN : LOSS</Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-badge-teal/20">
              <Text className="text-base">⚖️</Text>
            </View>
          </View>
        </View>

        {/* 5. GRAPH CARD */}
        <View className="rounded-2xl border border-cardBorder bg-card p-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-accentGreen" />
            <Text className="font-rajdhani-bold text-xs uppercase tracking-wider text-white">
              PUZZLE
            </Text>
          </View>

          <View className="mt-4 h-32 justify-between border-l border-cardBorder pl-2">
            {['2916', '2798', '2679', '2561'].map((val) => (
              <View key={val} className="flex-row items-center gap-2">
                <Text className="font-rajdhani text-[10px] text-text-muted">{val}</Text>
                <View className="h-[1px] flex-1 bg-cardBorder/50" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}