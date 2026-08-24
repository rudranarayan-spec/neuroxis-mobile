import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { dashboardService } from '../../src/services/dashboardService';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: dashboardService.getMetrics,
  });

  return (
    <ScreenContainer className="px-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#00FF66"
            colors={['#00FF66']}
          />
        }
      >
        {/* 1. OPERATIVE HEADER */}
        <View className="mb-6 flex-row items-center justify-between pt-4">
          <View>
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-neon animate-pulse" />
              <Text className="font-rajdhani-bold text-xs uppercase tracking-[0.25em] text-neon">
                SYSTEM_ONLINE
              </Text>
            </View>
            <Text className="mt-1 font-orbitron-black text-2xl text-white">
              WELCOME, <Text className="text-neon">{user?.username || 'OPERATIVE'}</Text>
            </Text>
          </View>

          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl border border-neon/40 bg-card">
            <Text className="font-orbitron text-xs text-neon">N</Text>
          </TouchableOpacity>
        </View>

        {/* 2. OPERATIVE HERO CARD */}
        <View className="relative mb-6 overflow-hidden rounded-2xl border border-neon/30 bg-card p-5 shadow-lg shadow-neon/10">
          <View className="flex-row justify-between border-b border-cardBorder/60 pb-3">
            <View>
              <Text className="font-rajdhani-bold text-[10px] uppercase tracking-[0.2em] text-text-muted">
                RANK RATING
              </Text>
              <Text className="font-orbitron text-xl text-white">
                {isLoading ? 'LOADING...' : metrics?.rank}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-rajdhani-bold text-[10px] uppercase tracking-[0.2em] text-neon">
                STREAK
              </Text>
              <Text className="font-orbitron text-xl text-neon">
                🔥 {metrics?.dailyStreak || 0}D
              </Text>
            </View>
          </View>

          {/* Core Stats Row */}
          <View className="mt-4 flex-row justify-between">
            <View>
              <Text className="font-rajdhani text-xs text-text-muted uppercase">MMR Score</Text>
              <Text className="font-orbitron text-lg text-white">{metrics?.mmr || 0}</Text>
            </View>

            <View>
              <Text className="font-rajdhani text-xs text-text-muted uppercase">Win Rate</Text>
              <Text className="font-orbitron text-lg text-neon">{metrics?.winRate || 0}%</Text>
            </View>

            <View>
              <Text className="font-rajdhani text-xs text-text-muted uppercase">Live Arenas</Text>
              <Text className="font-orbitron text-lg text-white">{metrics?.liveMatchesCount || 0}</Text>
            </View>
          </View>
        </View>

        {/* 3. QUICK ACTION GRID */}
        <Text className="mb-3 font-rajdhani-bold text-xs uppercase tracking-[0.2em] text-text-muted">
          COMMAND_MODULES
        </Text>

        <View className="mb-6 flex-row flex-wrap justify-between gap-3">
          {/* Quick Play Action */}
          <TouchableOpacity className="w-[48%] rounded-2xl border border-neon bg-neon/10 p-4 shadow-sm shadow-neon/20">
            <Text className="font-orbitron text-lg text-neon">⚔️ ENTER</Text>
            <Text className="mt-1 font-orbitron text-xs text-white">MATCHMAKING</Text>
            <Text className="mt-2 font-rajdhani text-[11px] text-neon-light">Ranked queue active</Text>
          </TouchableOpacity>

          {/* Tournaments Action */}
          <TouchableOpacity className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <Text className="font-orbitron text-lg text-white">🏆 TOURNAMENTS</Text>
            <Text className="mt-1 font-orbitron text-xs text-white">LEAGUES</Text>
            <Text className="mt-2 font-rajdhani text-[11px] text-text-muted">Season 4 open</Text>
          </TouchableOpacity>

          {/* Telemetry Stats */}
          <TouchableOpacity className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <Text className="font-orbitron text-lg text-white">📊 TELEMETRY</Text>
            <Text className="mt-1 font-orbitron text-xs text-white">ANALYTICS</Text>
            <Text className="mt-2 font-rajdhani text-[11px] text-text-muted">Match history</Text>
          </TouchableOpacity>

          {/* Cyber Shop */}
          <TouchableOpacity className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <Text className="font-orbitron text-lg text-white">⚡ UPGRADES</Text>
            <Text className="mt-1 font-orbitron text-xs text-white">ARMORY</Text>
            <Text className="mt-2 font-rajdhani text-[11px] text-text-muted">Gear & skins</Text>
          </TouchableOpacity>
        </View>

        {/* 4. LIVE TICKER BANNER */}
        <View className="rounded-2xl border border-cardBorder bg-card p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-rajdhani-bold text-xs uppercase tracking-widest text-neon">
              FEATURED_EVENT
            </Text>
            <View className="rounded-full bg-neon/20 px-2.5 py-0.5">
              <Text className="font-rajdhani-bold text-[10px] text-neon">LIVE NOW</Text>
            </View>
          </View>
          <Text className="mt-2 font-orbitron text-base text-white">
            {metrics?.activeTournament || 'INITIALIZING EVENT DATA...'}
          </Text>
          <Text className="mt-1 font-rajdhani text-xs text-text-muted">
            Pool Prize: 50,000 NEURO TOKENS • 128 Squads Remaining
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}