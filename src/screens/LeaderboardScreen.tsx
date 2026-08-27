import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  TextInput,
} from 'react-native';
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

export const LeaderboardScreen: React.FC = () => {
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

  const scoreUnit = category === 'xp' ? 'XP' : 'ELO';

  const handleApplyFilter = () => {
    setAppliedFilter(filterInput.trim());
  };

  const getBadgeBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return COLORS.cardBorder;
    }
  };

  const renderPodiumCard = (user?: LeaderboardUser, position?: number) => {
    if (!user) return <View style={{ width: 104 }} />;

    const isFirst = position === 1;

    return (
      <View
        style={{
          width: 104,
          backgroundColor: COLORS.card,
          borderColor: isFirst ? COLORS.primary : COLORS.cardBorder,
        }}
        className={`items-center rounded-2xl p-3 border shadow-xl ${
          isFirst ? '-translate-y-4 shadow-lime-500/10' : ''
        }`}
      >
        <View
          style={{
            borderColor: getBadgeBorder(user.rank),
            backgroundColor: COLORS.inputBg,
          }}
          className="h-14 w-14 rounded-full border-2 items-center justify-center overflow-hidden mb-2 relative"
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

        <Text
          style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.primary }}
          className="text-xs"
        >
          #{user.rank}
        </Text>

        <Text
          style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
          className="text-xs text-center mt-0.5"
          numberOfLines={1}
        >
          {user.username}
        </Text>

        <Text
          style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.secondary }}
          className="text-[11px] mt-0.5"
        >
          {user.score.toLocaleString()} {scoreUnit}
        </Text>
      </View>
    );
  };

  const renderListItem = ({ item }: { item: LeaderboardUser }) => (
    <View
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}
      className="flex-row items-center border px-4 py-3 rounded-xl mb-2.5"
    >
      <Text
        style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMuted }}
        className="w-10 text-xs"
      >
        #{item.rank}
      </Text>

      <View
        style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
        className="h-10 w-10 rounded-full border justify-center items-center overflow-hidden mr-3"
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
        <Text
          style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
          className="text-sm"
          numberOfLines={1}
        >
          {item.username}
        </Text>
        <Text
          style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
          className="text-xs"
        >
          Lvl {item.level} • 🔥 {item.streak}d streak
        </Text>
      </View>

      <Text
        style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
        className="text-xs"
      >
        {item.score.toLocaleString()}{' '}
        <Text style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}>
          {scoreUnit}
        </Text>
      </Text>
    </View>
  );

  return (
    <ScreenContainer excludeBottom style={{ backgroundColor: COLORS.background }}>
      {/* Category Tabs Header */}
      <View className="px-4 pb-3">
        <View
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}
          className="flex-row p-1.5 rounded-xl border"
        >
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={{
                  backgroundColor: isActive ? COLORS.primary : 'transparent',
                }}
                className="flex-1 py-2 rounded-lg items-center"
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
          <View
            style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
            className="flex-row items-center mt-3 px-3 py-1.5 rounded-xl border"
          >
            <TextInput
              value={filterInput}
              onChangeText={setFilterInput}
              placeholder={`Search ${category}...`}
              placeholderTextColor={COLORS.secondary}
              style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMain }}
              className="flex-1 text-sm py-1"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={handleApplyFilter}
              style={{ backgroundColor: COLORS.primary }}
              className="px-4 py-1.5 rounded-lg ml-2"
            >
              <Text
                style={{ fontFamily: FONTS.orbitronBold }}
                className="text-black text-xs"
              >
                APPLY
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.danger }}
            className="text-center mb-4 text-base"
          >
            Failed to connect to leaderboard network.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ backgroundColor: COLORS.primary }}
            className="px-6 py-3 rounded-xl"
          >
            <Text
              style={{ fontFamily: FONTS.orbitronBold }}
              className="text-black text-xs"
            >
              RETRY CONNECTION
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={remainingList}
          keyExtractor={(item) => item.userId}
          renderItem={renderListItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            topThree.length > 0 ? (
              <View className="flex-row justify-center items-end my-5 space-x-2">
                {renderPodiumCard(topThree[1], 2)}
                {renderPodiumCard(topThree[0], 1)}
                {renderPodiumCard(topThree[2], 3)}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-sm"
              >
                No active records found for this sector.
              </Text>
            </View>
          }
        />
      )}

      {/* Sticky User Standing Bar */}
      {myRankData?.data && myRankData.data.rank && (
        <View
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.primary }}
          className="absolute bottom-0 left-0 right-0 px-5 py-4 flex-row justify-between items-center border-t-2 shadow-2xl"
        >
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
              RANK #{myRankData.data.rank}
            </Text>
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
        </View>
      )}
    </ScreenContainer>
  );
};