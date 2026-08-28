import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { dashboardService } from '../../src/services/dashboardService';
import { Flame, Shield, Zap } from 'lucide-react-native';
import { GameModulesSection, GameItem } from '../../src/components/GameModulesSection';



export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();


  const { data: response, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => dashboardService.getDashboardStats(),
  });

  const metrics = response?.data;

  const handleSelectGame = (game: GameItem, mode: 'SOLO' | 'ONLINE') => {
    if (mode === 'ONLINE') {
      router.push({
        pathname: '/matchmaking',
        params: {
          gameId: game.id,
          title: game.title,
          route: game.route,
        },
      });
    } else {
      router.push({
        pathname: '/game-overview',
        params: {
          gameId: game.id,
          title: game.title,
          route: game.route,
          mode: 'SOLO',
        },
      });
    }
  };

  return (
    <ScreenContainer className="bg-background px-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#B5F23D"
            colors={['#B5F23D']}
          />
        }
      >
        {/* 1. HEADER WITH BADGES */}
        <View className="mb-5 flex-row items-center justify-between">
          {/* Left Section: Badges & Greeting */}
          <View className="gap-2">
            {/* Matiks Style Stat Badges Row */}
            <View className="flex-row items-center gap-2">
              {/* Level Badge - Shield Icon */}
              <View className="flex-row items-center gap-1.5 rounded-full border border-cardBorder bg-card px-3 py-1">
                <Shield size={12} color="#B5F23D" />
                <Text className="font-orbitron-bold text-xs text-text-main">
                  {metrics?.level || user?.level || 1}
                </Text>
              </View>

              {/* Daily Streak Badge - Flame Icon */}
              <View className="flex-row items-center gap-1.5 rounded-full border border-cardBorder bg-card px-3 py-1">
                <Flame size={12} color="#FF6B00" />
                <Text className="font-orbitron-bold text-xs text-text-main">
                  {metrics?.winStreak || '0 DAYS'}
                </Text>
              </View>

              {/* XP Badge - Zap/Energy Icon */}
              <View className="flex-row items-center gap-1.5 rounded-full border border-cardBorder bg-card px-3 py-1">
                <Zap size={12} color="#A855F7" />
                <Text className="font-orbitron-bold text-xs text-text-main">
                  {metrics?.totalXp || user?.xp || 0} XP
                </Text>
              </View>
            </View>

            {/* Welcome Greeting */}
            <View className="mt-1 ml-3 flex flex-row align-middle gap-1">
              <Text className="font-rajdhani text-md font-semibold text-text-muted">
                WELCOME BACK
              </Text>
              <Text className="font-rajdhani text-md font-semibold text-lime-400">
                {user?.username || metrics?.username.toLocaleUpperCase() || 'Gamer'}
              </Text>
            </View>
          </View>

          {/* Right Section: User Avatar */}
          <View className="h-11 w-11 items-center justify-center rounded-xl border border-cardBorder bg-card">
            <Text className="font-orbitron text-sm font-bold text-accentGreen">
              {(user?.username || metrics?.username || 'P1').substring(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* 3. CONSOLIDATED STATS GRID (ONLY 4 BOXES) */}
        <View className="mb-6">
          <Text className="ml-3 mb-3 font-rajdhani-bold text-base text-text-main">
            Stats Overview
          </Text>

          <View className="flex-row flex-wrap justify-between gap-3">
            {/* 1. RANK CARD */}
            <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="font-orbitron-black text-lg text-text-main">
                  {isLoading ? '...' : metrics?.rankTitle || 'LEGEND III'}
                </Text>
              </View>
              <Text className="mt-1 font-rajdhani-bold text-xs uppercase text-text-muted">
                CURRENT RANK
              </Text>
              <Text className="mt-2 font-rajdhani text-xs text-accentGreen">
                {metrics?.rankPercentile || 'Top 2%'}
              </Text>
            </View>

            {/* 2. RATING (MMR) */}
            <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="font-orbitron-black text-lg text-text-main">
                  {metrics?.mmrRating ?? 1200}
                </Text>
                <Text className="text-base">🧩</Text>
              </View>
              <Text className="mt-1 font-rajdhani-bold text-xs uppercase text-text-muted">
                RATING (MMR)
              </Text>
              <Text className="mt-2 font-rajdhani text-xs text-text-muted">
                Global Rank
              </Text>
            </View>

            {/* 3. WIN RATE */}
            <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="font-orbitron-black text-lg text-text-main">
                  {metrics?.winRate || '0%'}
                </Text>
                <Text className="text-base">⚡</Text>
              </View>
              <Text className="mt-1 font-rajdhani-bold text-xs uppercase text-text-muted">
                WIN RATE
              </Text>
              <Text className="mt-2 font-rajdhani text-xs text-accentGreen">
                {metrics?.totalMatches || 0} Total Played
              </Text>
            </View>

            {/* 4. WIN : LOSS RATIO */}
            <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="font-orbitron-black text-lg text-text-main">
                  {metrics?.winLossRatio || '0 : 0'}
                </Text>
                <Text className="text-base">⚖️</Text>
              </View>
              <Text className="mt-1 font-rajdhani-bold text-xs uppercase text-text-muted">
                WIN : LOSS
              </Text>
              <Text className="mt-2 font-rajdhani text-xs text-text-muted">
                {metrics?.liveArenasJoined || 0} Arenas
              </Text>
            </View>
          </View>
        </View>

        {/* 5. TOP RATED GAMES */}
        <GameModulesSection onSelectGame={handleSelectGame} />

        {/* 6. FEATURED TOURNAMENT CARD */}
        <View className="rounded-2xl border border-cardBorder bg-card p-4 mb-10">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-accentGreen" />
            <Text className="font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              FEATURED EVENT
            </Text>
          </View>
          <Text className="mt-2 font-orbitron-black text-lg text-text-main">
            Championship Season 4
          </Text>
          <Text className="mt-1 font-rajdhani text-xs text-text-muted">
            Prize Pool: $50,000 • 128 Squads Remaining
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}