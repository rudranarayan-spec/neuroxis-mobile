import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { tabDataService } from '../../src/services/tabDataService';

// Crossed Swords Icon
const CrossedSwordsIcon = ({ size = 20, color = "#B5F23D" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <Path d="M13 19l6 2 2-6-2.5-2.5" />
    <Path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
    <Path d="M11 5L5 3 3 9l2.5 2.5" />
  </Svg>
);

const CloseIcon = ({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18" />
    <Path d="M6 6l12 12" />
  </Svg>
);

export default function ArenasScreen() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING'>('ALL');
  const [joiningId, setJoiningId] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: arenas = [], isLoading } = useQuery({
    queryKey: ['arenasData'],
    queryFn: tabDataService.getArenas,
  });

  const filteredArenas = arenas.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  const handleJoin = (id: string | number) => {
    setJoiningId(id);
    setTimeout(() => {
      setJoiningId(null);
    }, 1200);
  };

  return (
    <ScreenContainer className="bg-background px-5">
      {/* Header */}
      <View className="mb-5 mt-2 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-rajdhani-bold text-xs uppercase tracking-[0.2em] text-accentGreen">
            ARENA_SELECTION
          </Text>
          <Text className="mt-0.5 font-orbitron-black text-2xl font-bold text-text-main">
            ACTIVE <Text className="text-accentGreen">CHALLENGES</Text>
          </Text>
        </View>

        {/* Crossed Swords Button to Trigger New Challenge Modal */}
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          className="h-11 w-11 items-center justify-center rounded-xl border border-accentGreen/30 bg-accentGreen/10 active:opacity-80"
          activeOpacity={0.7}
        >
          <CrossedSwordsIcon size={22} color="#B5F23D" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="mb-5 flex-row gap-2">
        {(['ALL', 'LIVE', 'UPCOMING'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`rounded-xl px-4 py-2 border transition-all ${
                isActive
                  ? 'border-accentGreen bg-accentGreen/10'
                  : 'border-cardBorder bg-card'
              }`}
            >
              <Text
                className={`font-rajdhani-bold text-xs font-semibold ${
                  isActive ? 'text-accentGreen' : 'text-text-muted'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Arenas / Challenges List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#B5F23D" size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {filteredArenas.map((item) => (
            <View
              key={item.id}
              className="mb-4 rounded-2xl border border-cardBorder bg-card p-4 shadow-sm"
            >
              {/* Card Header Tag */}
              <View className="flex-row items-center justify-between border-b border-cardBorder pb-3">
                <Text className="font-rajdhani-bold text-[11px] uppercase tracking-wider text-text-muted">
                  {item.category || 'CHALLENGE'}
                </Text>
                <View
                  className={`rounded-lg px-2.5 py-1 border ${
                    item.status === 'LIVE'
                      ? 'border-accentGreen/30 bg-accentGreen/10'
                      : 'border-cardBorder bg-background'
                  }`}
                >
                  <Text
                    className={`font-rajdhani-bold text-[10px] font-bold ${
                      item.status === 'LIVE' ? 'text-accentGreen' : 'text-text-muted'
                    }`}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Tournament Title */}
              <Text className="mt-3 font-orbitron text-base font-bold text-text-main">
                {item.title}
              </Text>

              {/* Key Metrics Grid */}
              <View className="my-4 flex-row justify-between rounded-xl border border-cardBorder bg-background/50 p-3">
                <View>
                  <Text className="font-rajdhani text-[11px] text-text-muted">Prize Pool</Text>
                  <Text className="font-orbitron text-sm font-bold text-accentGreen">
                    {item.prizePool}
                  </Text>
                </View>
                <View>
                  <Text className="font-rajdhani text-[11px] text-text-muted">Entry Fee</Text>
                  <Text className="font-orbitron text-sm font-bold text-text-main">
                    {item.entryFee}
                  </Text>
                </View>
                <View>
                  <Text className="font-rajdhani text-[11px] text-text-muted">Slots</Text>
                  <Text className="font-orbitron text-sm font-bold text-text-main">
                    {item.players}
                  </Text>
                </View>
              </View>

              {/* Join Action Button */}
              <TouchableOpacity
                onPress={() => handleJoin(item.id)}
                disabled={joiningId === item.id}
                className="w-full items-center justify-center rounded-xl bg-accentGreen py-3 active:opacity-90"
              >
                {joiningId === item.id ? (
                  <ActivityIndicator color="#121212" size="small" />
                ) : (
                  <Text className="font-orbitron text-xs font-bold uppercase text-background">
                    Join Challenge
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Create New Challenge Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/80 px-5">
          <View className="w-full rounded-2xl border border-cardBorder bg-card p-5">
            <View className="mb-4 flex-row items-center justify-between border-b border-cardBorder pb-3">
              <View className="flex-row items-center gap-2">
                <CrossedSwordsIcon size={20} color="#B5F23D" />
                <Text className="font-orbitron text-base font-bold text-text-main">
                  CREATE <Text className="text-accentGreen">CHALLENGE</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <CloseIcon size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text className="mb-6 font-rajdhani text-sm text-text-muted">
              Select your match preferences to broadcast a custom challenge lobby to active players.
            </Text>

            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              className="w-full items-center justify-center rounded-xl bg-accentGreen py-3.5 active:opacity-90"
            >
              <Text className="font-orbitron text-xs font-bold uppercase text-background">
                LAUNCH LOBBY
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}