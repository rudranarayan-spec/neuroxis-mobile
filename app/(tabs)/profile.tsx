import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, FONTS } from '../../src/constants/theme'; 

// SVG Icons
const UserIcon = ({ size = 18, color = COLORS.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const ShieldIcon = ({ size = 18, color = COLORS.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const BellIcon = ({ size = 18, color = COLORS.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const ChevronRightIcon = ({ size = 16, color = COLORS.secondary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const LogOutIcon = ({ size = 18, color = COLORS.danger }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Path d="M16 17l5-5-5-5" />
    <Path d="M21 12H9" />
  </Svg>
);

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to terminate your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScreenContainer style={{ backgroundColor: COLORS.background }} className="px-4 sm:px-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        {/* Header Label */}
        <View className="mb-4 mt-3">
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.primary }}
            className="text-[11px] uppercase tracking-[0.25em]"
          >
            SYSTEM_IDENTITY
          </Text>
          <Text
            style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.textMain }}
            className="mt-1 text-2xl sm:text-3xl"
          >
            OPERATOR <Text style={{ color: COLORS.primary }}>PROFILE</Text>
          </Text>
        </View>

        {/* User Card */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.cardBorder,
          }}
          className="mb-6 rounded-3xl border p-6 items-center shadow-xl"
        >
          {/* Avatar Ring */}
          <View
            style={{
              borderColor: COLORS.primary,
              backgroundColor: COLORS.inputBg,
              shadowColor: COLORS.primary,
            }}
            className="h-24 w-24 items-center justify-center rounded-full border-2 shadow-md"
          >
            <Text
              style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.primary }}
              className="text-3xl"
            >
              {user?.username?.substring(0, 2).toUpperCase() || 'P1'}
            </Text>
          </View>

          {/* User Meta */}
          <Text
            style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
            className="mt-4 text-xl"
          >
            {user?.username || 'Player One'}
          </Text>
          <Text
            style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
            className="mt-0.5 text-xs tracking-wider"
          >
            {user?.email || 'player@game.com'}
          </Text>

          {/* Player Badge */}
          <View
            style={{
              backgroundColor: `${COLORS.primary}15`,
              borderColor: `${COLORS.primary}40`,
            }}
            className="mt-3 rounded-full border px-3 py-1"
          >
            <Text
              style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.primary }}
              className="text-[10px] uppercase tracking-widest"
            >
              ● TIER 1 OPERATOR
            </Text>
          </View>

          {/* Quick Combat Stats Overview */}
          <View
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: `${COLORS.cardBorder}80`,
            }}
            className="mt-6 flex-row w-full justify-between rounded-2xl border p-3.5"
          >
            <View className="flex-1 items-center">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-[11px]"
              >
                MATCHES
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="mt-0.5 text-base"
              >
                142
              </Text>
            </View>

            <View className="flex-1 items-center border-x border-cardBorder/40">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-[11px]"
              >
                WIN RATE
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
                className="mt-0.5 text-base"
              >
                68.4%
              </Text>
            </View>

            <View className="flex-1 items-center">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-[11px]"
              >
                RANK
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="mt-0.5 text-base"
              >
                #412
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings List */}
        <Text
          style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
          className="mb-3 text-[11px] uppercase tracking-widest"
        >
          CONFIGURATION & SECURITY
        </Text>

        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.cardBorder,
          }}
          className="mb-6 overflow-hidden rounded-3xl border"
        >
          {/* Item 1 */}
          <TouchableOpacity
            style={{ borderColor: COLORS.cardBorder }}
            className="flex-row items-center justify-between border-b p-4 active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <UserIcon size={18} color={COLORS.primary} />
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
              >
                Account Settings
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-xs"
              >
                Edit Profile
              </Text>
              <ChevronRightIcon size={16} color={COLORS.secondary} />
            </View>
          </TouchableOpacity>

          {/* Item 2 */}
          <TouchableOpacity
            style={{ borderColor: COLORS.cardBorder }}
            className="flex-row items-center justify-between border-b p-4 active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <ShieldIcon size={18} color={COLORS.primary} />
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
              >
                Security & Password
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-xs"
              >
                Protected
              </Text>
              <ChevronRightIcon size={16} color={COLORS.secondary} />
            </View>
          </TouchableOpacity>

          {/* Item 3 */}
          <TouchableOpacity className="flex-row items-center justify-between p-4 active:opacity-80">
            <View className="flex-row items-center gap-3">
              <BellIcon size={18} color={COLORS.primary} />
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
              >
                Notifications
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-xs"
              >
                Enabled
              </Text>
              <ChevronRightIcon size={16} color={COLORS.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Log Out CTA Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: `${COLORS.danger}15`,
            borderColor: COLORS.danger,
          }}
          className="flex-row items-center justify-center gap-2 rounded-2xl border py-4 active:opacity-80"
        >
          <LogOutIcon size={18} color={COLORS.danger} />
          <Text
            style={{ fontFamily: FONTS.orbitronBold, color: COLORS.danger }}
            className="text-xs uppercase tracking-widest"
          >
            TERMINATE SESSION
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}