

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLeaderboard, useMyRank } from '../hooks/useLeaderboard';
import { LeaderboardCategory, LeaderboardUser } from '../types/leaderboard';
import { ScreenContainer } from '../components/ScreenContainer'; // Adjust path if needed
import { COLORS, FONTS } from '../constants/theme'; // Adjust path if needed

const CATEGORIES: { label: string; value: LeaderboardCategory }[] = [
  { label: 'GLOBAL', value: 'global' },
  { label: 'REGION', value: 'region' },
  { label: 'DISTRICT', value: 'district' },
  { label: 'XP TOP', value: 'xp' },
];

const TIER_META: Record<1 | 2 | 3, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  1: { color: '#FFD700', icon: 'trophy' },
  2: { color: '#C0C0C0', icon: 'medal' },
  3: { color: '#CD7F32', icon: 'medal' },
};

const ROW_HEIGHT = 78; // fixed row height incl. margin — enables reliable getItemLayout
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const LeaderboardScreen: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();

  const [category, setCategory] = useState<LeaderboardCategory>('global');
  const [filterInput, setFilterInput] = useState<string>('INDIA');
  const [appliedFilter, setAppliedFilter] = useState<string>('INDIA');

  const activeFilter = useMemo(() => {
    return category === 'region' || category === 'district' ? appliedFilter : '';
  }, [category, appliedFilter]);

  const { data, isLoading, isError, refetch, isRefetching } = useLeaderboard({
    type: category,
    filter: activeFilter,
    page: 1,
    limit: 50,
  });

  const { data: myRankData } = useMyRank(category, activeFilter);

  const leaderboardList = data?.data || [];
  const topThree = leaderboardList.slice(0, 3);
  const remainingList = leaderboardList.slice(3);
  const myRank = myRankData?.data?.rank;

  const scoreUnit = category === 'xp' ? 'XP' : 'ELO';

  const podiumCardWidth = clamp((windowWidth - 32 - 24) / 3, 92, 132);

  const flatListRef = useRef<FlatList<LeaderboardUser>>(null);

  const handleApplyFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAppliedFilter(filterInput.trim());
  };

  const handleCategoryChange = (value: LeaderboardCategory) => {
    if (value === category) return;
    Haptics.selectionAsync().catch(() => {});
    setCategory(value);
  };

  const handleLocateMe = () => {
    if (!myRank) return;
    const idx = remainingList.findIndex((u) => u.rank === myRank);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (idx >= 0) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.35 });
    }
    // If not found in the current page (e.g. you're rank 80 of 50 loaded),
    // there's nothing to scroll to — the sticky bar still shows your rank.
  };

  // ── Animated sliding tab indicator ──────────────────────────────────

  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const pillX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const pillReady = useRef(false);

  useEffect(() => {
    const layout = tabLayouts[category];
    if (!layout) return;
    if (!pillReady.current) {
      pillX.setValue(layout.x);
      pillWidth.setValue(layout.width);
      pillReady.current = true;
      return;
    }
    Animated.spring(pillX, {
      toValue: layout.x,
      useNativeDriver: false,
      friction: 9,
      tension: 90,
    }).start();
    Animated.spring(pillWidth, {
      toValue: layout.width,
      useNativeDriver: false,
      friction: 9,
      tension: 90,
    }).start();
  }, [category, tabLayouts]);

  // ── Entrance fade for content ───────────────────────────────────────

  const contentFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isLoading && !isError) {
      contentFade.setValue(0);
      Animated.timing(contentFade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }
  }, [isLoading, isError, category, activeFilter]);

  // ── Skeleton shimmer ─────────────────────────────────────────────────

  const shimmer = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const SkeletonBlock = ({ style }: { style?: any }) => (
    <Animated.View
      style={[{ backgroundColor: COLORS.card, opacity: shimmer, borderRadius: 12 }, style]}
    />
  );

  // ── Render helpers ───────────────────────────────────────────────────

  const renderPodiumCard = (user?: LeaderboardUser, position?: 1 | 2 | 3) => {
    if (!user || !position) return <View style={{ width: podiumCardWidth }} />;

    const tier = TIER_META[position];
    const isFirst = position === 1;

    return (
      <View style={{ width: podiumCardWidth, alignItems: 'center' }}>
        {isFirst && (
          <View style={{ marginBottom: -8, zIndex: 2 }}>
            <Ionicons name="trophy" size={22} color={tier.color} />
          </View>
        )}

        <View
          style={{
            width: '100%',
            backgroundColor: COLORS.card,
            borderColor: isFirst ? tier.color : COLORS.cardBorder,
            transform: [{ translateY: isFirst ? -14 : 0 }],
            shadowColor: tier.color,
            shadowOpacity: isFirst ? 0.45 : 0.15,
            shadowRadius: isFirst ? 16 : 6,
            shadowOffset: { width: 0, height: 6 },
            elevation: isFirst ? 10 : 3,
          }}
          className="items-center rounded-2xl border p-3"
        >
          <View
            style={{
              borderColor: tier.color,
              backgroundColor: COLORS.inputBg,
              shadowColor: tier.color,
              shadowOpacity: 0.6,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
            }}
            className="mb-2 h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2"
          >
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="h-full w-full" />
            ) : (
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="text-lg"
              >
                {user.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {!isFirst && (
            <Ionicons name={tier.icon} size={14} color={tier.color} style={{ marginBottom: 2 }} />
          )}

          <Text style={{ fontFamily: FONTS.orbitronBlack, color: tier.color }} className="text-xs">
            #{user.rank}
          </Text>

          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
            className="mt-0.5 text-center text-xs"
            numberOfLines={1}
          >
            {user.username}
          </Text>

          <Text
            style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.secondary }}
            className="mt-0.5 text-[11px]"
          >
            {user.score.toLocaleString()} {scoreUnit}
          </Text>
        </View>
      </View>
    );
  };

  const renderListItem = useCallback(
    ({ item }: { item: LeaderboardUser }) => {
      const isMe = myRank != null && myRank === item.rank;

      return (
        <View
          style={{
            height: ROW_HEIGHT - 10,
            backgroundColor: isMe ? COLORS.inputBg : COLORS.card,
            borderColor: isMe ? COLORS.primary : COLORS.cardBorder,
            borderWidth: isMe ? 1.5 : 1,
          }}
          className="mb-2.5 flex-row items-center rounded-xl px-4 py-3"
        >
          <Text
            style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMuted }}
            className="w-10 text-xs"
          >
            #{item.rank}
          </Text>

          <View
            style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
            className="mr-3 h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} className="h-full w-full" />
            ) : (
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="text-sm"
              >
                {item.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
                numberOfLines={1}
              >
                {item.username}
              </Text>
              {isMe && (
                <View
                  style={{ backgroundColor: COLORS.primary }}
                  className="ml-2 rounded-full px-2 py-0.5"
                >
                  <Text
                    style={{ fontFamily: FONTS.orbitronBold, color: '#000' }}
                    className="text-[9px]"
                  >
                    YOU
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-xs"
              >
                Lvl {item.level}
              </Text>
              <Ionicons
                name="flame"
                size={11}
                color="#F97316"
                style={{ marginLeft: 8, marginRight: 2 }}
              />
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-xs"
              >
                {item.streak}d streak
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }} className="text-xs">
              {item.score.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }} className="text-[10px]">
              {scoreUnit}
            </Text>
          </View>
        </View>
      );
    },
    [myRank, scoreUnit]
  );

  return (
    <ScreenContainer excludeBottom style={{ backgroundColor: COLORS.background }}>
      {/* Category Tabs Header */}
      <View className="px-4 pb-3">
        <View
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}
          className="relative flex-row rounded-xl border p-1.5"
        >
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 6,
              bottom: 6,
              left: pillX,
              width: pillWidth,
              backgroundColor: COLORS.primary,
              borderRadius: 10,
            }}
          />
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => handleCategoryChange(cat.value)}
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  setTabLayouts((prev) => ({ ...prev, [cat.value]: { x, width } }));
                }}
                className="z-10 flex-1 items-center rounded-lg py-2"
              >
                <Text
                  style={{
                    fontFamily: FONTS.orbitronBold,
                    color: isActive ? '#000000' : COLORS.textMuted,
                  }}
                  className="text-[10px]"
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Regional / District Filter Bar */}
        {(category === 'region' || category === 'district') && (
          <>
            <View
              style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
              className="mt-3 flex-row items-center rounded-xl border px-3 py-1.5"
            >
              <Ionicons name="search" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                value={filterInput}
                onChangeText={setFilterInput}
                placeholder={`Search ${category}...`}
                placeholderTextColor={COLORS.secondary}
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMain }}
                className="flex-1 py-1 text-sm"
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleApplyFilter}
              />
              <TouchableOpacity
                onPress={handleApplyFilter}
                style={{ backgroundColor: COLORS.primary }}
                className="ml-2 rounded-lg px-4 py-1.5"
              >
                <Text style={{ fontFamily: FONTS.orbitronBold }} className="text-xs text-black">
                  APPLY
                </Text>
              </TouchableOpacity>
            </View>

            {appliedFilter ? (
              <View className="mt-2 flex-row">
                <View
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                  className="flex-row items-center rounded-full border px-3 py-1"
                >
                  <Ionicons name="location" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text
                    style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                    className="text-[11px]"
                  >
                    {appliedFilter}
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View className="flex-1 px-4">
          <View className="my-5 flex-row items-end justify-center" style={{ gap: 12 }}>
            <SkeletonBlock style={{ width: podiumCardWidth, height: 118 }} />
            <SkeletonBlock style={{ width: podiumCardWidth, height: 148 }} />
            <SkeletonBlock style={{ width: podiumCardWidth, height: 118 }} />
          </View>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} style={{ height: ROW_HEIGHT - 10, marginBottom: 10 }} />
          ))}
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cloud-offline-outline" size={40} color={COLORS.danger} style={{ marginBottom: 12 }} />
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
            className="mb-1 text-center text-base"
          >
            Couldn't reach the leaderboard
          </Text>
          <Text
            style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
            className="mb-5 text-center text-xs"
          >
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ backgroundColor: COLORS.primary }}
            className="rounded-xl px-6 py-3"
          >
            <Text style={{ fontFamily: FONTS.orbitronBold }} className="text-xs text-black">
              RETRY CONNECTION
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: contentFade }}>
          <FlatList
            ref={flatListRef}
            data={remainingList}
            keyExtractor={(item) => item.userId}
            renderItem={renderListItem}
            getItemLayout={(_, index) => ({
              length: ROW_HEIGHT,
              offset: ROW_HEIGHT * index,
              index,
            })}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
            }
            onScrollToIndexFailed={() => {}}
            ListHeaderComponent={
              topThree.length > 0 ? (
                <View className="my-5 flex-row items-end justify-center" style={{ gap: 12 }}>
                  {renderPodiumCard(topThree[1], 2)}
                  {renderPodiumCard(topThree[0], 1)}
                  {renderPodiumCard(topThree[2], 3)}
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center py-16">
                <Ionicons name="podium-outline" size={36} color={COLORS.textMuted} style={{ marginBottom: 10 }} />
                <Text
                  style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                  className="mb-1 text-sm"
                >
                  No one's on the board yet
                </Text>
                <Text
                  style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                  className="text-center text-xs"
                >
                  Play a match to claim the top spot in this category.
                </Text>
              </View>
            }
          />
        </Animated.View>
      )}

      {/* Sticky User Standing Bar */}
      {myRankData?.data && myRank && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLocateMe}
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.primary }}
          className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t-2 px-5 py-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="locate" size={16} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMuted }}
                className="text-[10px]"
              >
                YOUR STANDING
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.textMain }}
                className="text-base"
              >
                RANK #{myRank}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text
              style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMuted }}
              className="text-[10px]"
            >
              SCORE
            </Text>
            <Text
              style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.primary }}
              className="text-base"
            >
              {myRankData.data.score?.toLocaleString()} {scoreUnit}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </ScreenContainer>
  );
};