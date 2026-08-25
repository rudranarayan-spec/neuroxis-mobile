import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { tabDataService } from '../../src/services/tabDataService';
import { COLORS, FONTS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

// Responsive utility sizes based on screen width
const isSmallDevice = width < 380;

// Crossed Swords Icon
const CrossedSwordsIcon = ({ size = 20, color = COLORS.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <Path d="M13 19l6 2 2-6-2.5-2.5" />
    <Path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
    <Path d="M11 5L5 3 3 9l2.5 2.5" />
  </Svg>
);

const CloseIcon = ({ size = 20, color = COLORS.textMain }: { size?: number; color?: string }) => (
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
    <ScreenContainer style={{ backgroundColor: COLORS.background }} className="px-4 sm:px-6">
      {/* Header */}
      <View className="mb-6 mt-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.primary }}
            className="text-[11px] uppercase tracking-[0.25em]"
          >
            ARENA_SELECTION
          </Text>
          <Text
            style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.textMain }}
            className="mt-1 text-2xl sm:text-3xl"
          >
            ACTIVE <Text style={{ color: COLORS.primary }}>CHALLENGES</Text>
          </Text>
        </View>

        {/* Crossed Swords Button - Modernized Dark Glass & Primary Accent */}
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={{
            backgroundColor: `${COLORS.primary}12`,
            borderColor: `${COLORS.primary}40`,
          }}
          className="h-12 w-12 items-center justify-center rounded-2xl border active:scale-95"
          activeOpacity={0.8}
        >
          <CrossedSwordsIcon size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="mb-6 flex-row gap-2.5">
        {(['ALL', 'LIVE', 'UPCOMING'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                backgroundColor: isActive ? `${COLORS.primary}1A` : COLORS.card,
                borderColor: isActive ? COLORS.primary : COLORS.cardBorder,
              }}
              className="rounded-xl border px-4 py-2.5 active:opacity-90"
            >
              <Text
                style={{
                  fontFamily: FONTS.rajdhaniBold,
                  color: isActive ? COLORS.primary : COLORS.textMuted,
                }}
                className="text-xs tracking-wider"
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Arenas / Challenges List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {filteredArenas.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: COLORS.card,
                borderColor: COLORS.cardBorder,
              }}
              className="mb-4 rounded-3xl border p-4 sm:p-5 shadow-lg"
            >
              {/* Card Header Tag */}
              <View
                style={{ borderColor: COLORS.cardBorder }}
                className="flex-row items-center justify-between border-b pb-3"
              >
                <Text
                  style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
                  className="text-[11px] uppercase tracking-widest"
                >
                  {item.category || 'CHALLENGE'}
                </Text>

                <View
                  style={{
                    backgroundColor: item.status === 'LIVE' ? `${COLORS.primary}15` : COLORS.inputBg,
                    borderColor: item.status === 'LIVE' ? `${COLORS.primary}40` : COLORS.cardBorder,
                  }}
                  className="rounded-full border px-3 py-1"
                >
                  <Text
                    style={{
                      fontFamily: FONTS.rajdhaniBold,
                      color: item.status === 'LIVE' ? COLORS.primary : COLORS.secondary,
                    }}
                    className="text-[10px] tracking-wider"
                  >
                    {item.status === 'LIVE' ? '● LIVE NOW' : item.status}
                  </Text>
                </View>
              </View>

              {/* Tournament Title */}
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="mt-3.5 text-base sm:text-lg"
              >
                {item.title}
              </Text>

              {/* Key Metrics Grid */}
              <View
                style={{
                  backgroundColor: COLORS.inputBg,
                  borderColor: `${COLORS.cardBorder}80`,
                }}
                className="my-4 flex-row justify-between rounded-2xl border p-3.5"
              >
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                    className="text-[11px]"
                  >
                    Prize Pool
                  </Text>
                  <Text
                    style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
                    className="mt-0.5 text-sm sm:text-base"
                  >
                    {item.prizePool}
                  </Text>
                </View>

                <View className="flex-1 items-center border-x border-cardBorder/40 px-2">
                  <Text
                    style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                    className="text-[11px]"
                  >
                    Entry Fee
                  </Text>
                  <Text
                    style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                    className="mt-0.5 text-sm sm:text-base"
                  >
                    {item.entryFee}
                  </Text>
                </View>

                <View className="flex-1 items-end">
                  <Text
                    style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                    className="text-[11px]"
                  >
                    Slots
                  </Text>
                  <Text
                    style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                    className="mt-0.5 text-sm sm:text-base"
                  >
                    {item.players}
                  </Text>
                </View>
              </View>

              {/* Replaced High-Contrast Solid Lime with Modern Dark-Glass + Glowing Accent Border Button */}
              <TouchableOpacity
                onPress={() => handleJoin(item.id)}
                disabled={joiningId === item.id}
                style={{
                  backgroundColor: `${COLORS.primary}15`,
                  borderColor: COLORS.primary,
                }}
                className="w-full items-center justify-center rounded-2xl border py-3.5 active:opacity-80"
              >
                {joiningId === item.id ? (
                  <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{
                        fontFamily: FONTS.orbitronBold,
                        color: COLORS.primary,
                      }}
                      className="text-xs uppercase tracking-widest"
                    >
                      ENTER ARENA
                    </Text>
                  </View>
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
        <View className="flex-1 items-center justify-center bg-black/85 px-5">
          <View
            style={{
              backgroundColor: COLORS.card,
              borderColor: COLORS.cardBorder,
            }}
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <View
              style={{ borderColor: COLORS.cardBorder }}
              className="mb-4 flex-row items-center justify-between border-b pb-4"
            >
              <View className="flex-row items-center gap-2.5">
                <CrossedSwordsIcon size={20} color={COLORS.primary} />
                <Text
                  style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                  className="text-base"
                >
                  CREATE <Text style={{ color: COLORS.primary }}>CHALLENGE</Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="rounded-full p-1 active:opacity-70"
              >
                <CloseIcon size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
              className="mb-6 text-sm leading-relaxed"
            >
              Select your match preferences to broadcast a custom challenge lobby to active players.
            </Text>

            {/* Modal Action Button */}
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
              }}
              className="w-full items-center justify-center rounded-2xl py-4 shadow-lg active:opacity-90"
            >
              <Text
                style={{
                  fontFamily: FONTS.orbitronBold,
                  color: COLORS.background,
                }}
                className="text-xs uppercase tracking-widest"
              >
                LAUNCH LOBBY
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}