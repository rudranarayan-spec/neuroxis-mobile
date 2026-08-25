import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { dashboardService } from '../../src/services/dashboardService';

interface GameItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  xpReward: string;
  route: string;
  isAvailable: boolean;
}

const TOP_GAMES: GameItem[] = [
  {
    id: 'sudoku',
    title: 'Matrix Sudoku 6x6',
    category: 'Logic & Decryption',
    rating: 4.9,
    xpReward: '+50 XP',
    route: '/game/sudoku',
    isAvailable: true,
  },
  {
    id: 'memory_matrix',
    title: 'Pattern Recall',
    category: 'Memory & Speed',
    rating: 4.7,
    xpReward: '+40 XP',
    route: '/game/pattern-recall',
    isAvailable: false,
  },
  {
    id: 'sequence_breaker',
    title: 'Sequence Breaker',
    category: 'Pattern Analysis',
    rating: 4.8,
    xpReward: '+60 XP',
    route: '/game/sequence-breaker',
    isAvailable: false,
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('7 DAYS');

  const filterTabs = ['TODAY', '7 DAYS', '30 DAYS', 'ALL TIME'];

  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: dashboardService.getMetrics,
  });

  const handlePlayGame = (game: GameItem) => {
    if (game.isAvailable) {
      router.push({
        pathname: '/game-overview',
        params: {
          gameId: game.id,
          title: game.title,
          route: game.route
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
        {/* 1. HEADER */}
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="font-rajdhani text-xs font-semibold text-text-muted">
              WELCOME BACK
            </Text>
            <Text className="font-orbitron-black text-2xl text-text-main">
              {user?.username || 'Gamer'}
            </Text>
          </View>

          {/* User Avatar Badge */}
          <View className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card">
            <Text className="font-orbitron text-xs font-bold text-accentGreen">
              {user?.username?.substring(0, 2).toUpperCase() || 'P1'}
            </Text>
          </View>
        </View>

        {/* 2. PILL FILTER TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 flex-row gap-2"
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveFilter(tab)}
                className={`rounded-full border px-4 py-2 ${isActive
                  ? 'border-accentGreen bg-accentGreen/10'
                  : 'border-cardBorder bg-card'
                  }`}
              >
                <Text
                  className={`font-rajdhani-bold text-xs ${isActive ? 'text-accentGreen' : 'text-text-muted'
                    }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. FEATURED MODES GRID */}
        <View className="mb-6 flex-row flex-wrap justify-between gap-3">
          {/* RANK CARD */}
          <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <Text className="font-orbitron-black text-xl text-text-main">
              {isLoading ? '...' : metrics?.rank || 'LEGEND III'}
            </Text>
            <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              CURRENT RANK
            </Text>
            <Text className="mt-3 font-rajdhani text-xs text-text-muted">Top 2%</Text>
          </View>

          {/* WIN RATE CARD */}
          <View className="w-[48%] rounded-2xl border border-cardBorder bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-orbitron-black text-2xl text-text-main">
                {metrics?.winRate || 68.5}%
              </Text>
              <View className="h-6 w-6 items-center justify-center rounded-lg bg-cardBorder">
                <Text className="text-xs">⚡</Text>
              </View>
            </View>
            <Text className="mt-1 font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
              WIN RATE
            </Text>
            <Text className="mt-3 font-rajdhani-bold text-xs text-accentGreen">
              +4.2% ↑
            </Text>
          </View>
        </View>

        {/* 4. STATS OVERVIEW SECTION */}
        <Text className="mb-3 font-rajdhani-bold text-base text-text-main">
          Stats Overview
        </Text>

        <View className="mb-6 flex-row flex-wrap justify-between gap-3">
          {/* RATING */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-text-main">
                {metrics?.mmr || 2840}
              </Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">
                RATING (MMR)
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-cardBorder">
              <Text className="text-base">🧩</Text>
            </View>
          </View>

          {/* WIN STREAK */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-text-main">
                {metrics?.dailyStreak || 7} WINS
              </Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">
                STREAK
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-cardBorder">
              <Text className="text-base">👑</Text>
            </View>
          </View>

          {/* LIVE ARENAS */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-text-main">
                {metrics?.liveMatchesCount || 14}
              </Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">
                LIVE ARENAS
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-cardBorder">
              <Text className="text-base">🎮</Text>
            </View>
          </View>

          {/* MATCHES PLAYED */}
          <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-cardBorder bg-card p-3.5">
            <View>
              <Text className="font-orbitron-black text-lg text-text-main">
                143 : 99
              </Text>
              <Text className="font-rajdhani text-xs uppercase text-text-muted">
                WIN : LOSS
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-cardBorder">
              <Text className="text-base">⚖️</Text>
            </View>
          </View>
        </View>

        {/* 5. TOP RATED GAMES */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-rajdhani-bold text-base text-text-main">
              Top Rated Games
            </Text>
            <Text className="font-rajdhani text-xs text-text-muted">
              {TOP_GAMES.length} MODULES
            </Text>
          </View>

          <View className="gap-3">
            {TOP_GAMES.map((game) => (
              <TouchableOpacity
                key={game.id}
                onPress={() => handlePlayGame(game)}
                activeOpacity={game.isAvailable ? 0.8 : 1}
                className={`rounded-2xl border border-cardBorder bg-card p-4 ${!game.isAvailable ? 'opacity-50' : ''
                  }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-rajdhani-bold text-xs uppercase tracking-wider text-text-muted">
                    {game.category}
                  </Text>
                  <Text className="font-rajdhani-bold text-xs text-yellow-400">
                    ★ {game.rating}
                  </Text>
                </View>

                <Text className="mt-1 font-orbitron-black text-lg text-text-main">
                  {game.title}
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-rajdhani-bold text-xs text-accentGreen">
                    {game.xpReward}
                  </Text>

                  <View
                    className={`rounded-xl px-4 py-2 border ${game.isAvailable
                      ? 'border-accentGreen bg-accentGreen/10'
                      : 'border-cardBorder bg-cardBorder'
                      }`}
                  >
                    <Text
                      className={`font-rajdhani-bold text-xs ${game.isAvailable ? 'text-accentGreen' : 'text-text-muted'
                        }`}
                    >
                      {game.isAvailable ? 'PLAY NOW' : 'LOCKED'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. FEATURED TOURNAMENT CARD */}
        <View className="rounded-2xl border border-cardBorder bg-card p-4">
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