import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Share2,
  MessageSquare,
  Trophy,
  Settings,
  Bug,
  Star,
} from 'lucide-react-native';

import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { useConfirm } from '../../src/context/ConfirmContext';
import { showToast } from '../../src/config/toastConfig';
import { COLORS, FONTS } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();
  const router = useRouter();

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'TERMINATE SESSION',
      message: 'Are you sure you want to disconnect from the Neuroxis network?',
      confirmText: 'DISCONNECT',
      cancelText: 'ABORT',
      isDanger: true,
    });

    if (isConfirmed) {
      await logout();
      showToast.success('SESSION TERMINATED', 'Disconnected successfully.');
      router.replace('/(auth)/login');
    }
  };

  const handleAction = (label: string) => {
    showToast.info('FEATURE LOCKED', `${label} integration coming in next patch.`);
  };

  const hubItems = [
    { label: 'Referral', icon: Share2, action: () => handleAction('Referral') },
    { label: 'Discord', icon: MessageSquare, action: () => handleAction('Discord') },
    { label: 'Leaderboard', icon: Trophy, action: () => handleAction('Leaderboard') },
    { label: 'Settings', icon: Settings, action: () => handleAction('Settings') },
    { label: 'Report Bug', icon: Bug, action: () => handleAction('Bug Report') },
    { label: 'Rate App', icon: Star, action: () => handleAction('Rating') },
  ];

  return (
    <ScreenContainer style={{ backgroundColor: COLORS.background }} className="px-4 sm:px-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Header Section */}
        <View className="mb-5 mt-3">
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
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

        {/* User Identity Card */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.cardBorder,
          }}
          className="mb-6 rounded-3xl border p-5 sm:p-6 items-center shadow-2xl"
        >
          {/* Avatar Ring */}
          <View
            style={{
              borderColor: COLORS.cardBorder,
              backgroundColor: COLORS.inputBg,
            }}
            className="h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-2 relative"
          >
            <Text
              style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.textMain }}
              className="text-2xl sm:text-3xl"
            >
              {user?.username?.substring(0, 2).toUpperCase() || 'OP'}
            </Text>
            {/* Status Indicator */}
            <View
              style={{ backgroundColor: COLORS.primary }}
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background"
            />
          </View>

          {/* User Meta */}
          <Text
            style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
            className="mt-3 text-lg sm:text-xl text-center"
            numberOfLines={1}
          >
            {user?.username || 'Operator One'}
          </Text>
          <Text
            style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
            className="mt-0.5 text-xs tracking-wider text-center"
            numberOfLines={1}
          >
            {user?.email || 'operator@matiks.net'}
          </Text>

          {/* Tier Badge */}
          <View
            style={{
              backgroundColor: `${COLORS.cardBorder}60`,
              borderColor: COLORS.cardBorder,
            }}
            className="mt-3 rounded-full border px-3 py-1"
          >
            <Text
              style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
              className="text-[10px] uppercase tracking-widest"
            >
              LEVEL 42 OPERATOR
            </Text>
          </View>

          {/* Combat & System Stats Grid */}
          <View
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: `${COLORS.cardBorder}80`,
            }}
            className="mt-5 flex-row w-full justify-between rounded-2xl border p-3.5"
          >
            <View className="flex-1 items-center px-1">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-[10px] uppercase"
                numberOfLines={1}
              >
                MATCHES
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="mt-0.5 text-sm sm:text-base"
                numberOfLines={1}
              >
                142
              </Text>
            </View>

            <View className="flex-1 items-center border-x border-cardBorder/40 px-1">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-[10px] uppercase"
                numberOfLines={1}
              >
                WIN RATE
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
                className="mt-0.5 text-sm sm:text-base"
                numberOfLines={1}
              >
                68.4%
              </Text>
            </View>

            <View className="flex-1 items-center px-1">
              <Text
                style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                className="text-[10px] uppercase"
                numberOfLines={1}
              >
                RANK
              </Text>
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="mt-0.5 text-sm sm:text-base"
                numberOfLines={1}
              >
                #412
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Hub - Grid Action Buttons */}
        <Text
          style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
          className="mb-3 text-[11px] uppercase tracking-widest"
        >
          OPERATOR HUB
        </Text>

        <View className="mb-6 flex-row flex-wrap justify-between gap-y-3">
          {hubItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={idx}
                onPress={item.action}
                style={{
                  backgroundColor: COLORS.card,
                  borderColor: COLORS.cardBorder,
                }}
                className="w-[31%] min-h-[90px] items-center justify-center rounded-2xl border py-3 px-1 active:opacity-70"
              >
                <View
                  style={{ backgroundColor: COLORS.inputBg }}
                  className="mb-1.5 p-2 sm:p-2.5 rounded-xl border border-cardBorder/40"
                >
                  <IconComponent size={18} color={COLORS.textMain} />
                </View>
                <Text
                  style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                  className="text-center text-[11px] sm:text-xs"
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Security & Account List */}
        <Text
          style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
          className="mb-3 text-[11px] uppercase tracking-widest"
        >
          SECURITY & PREFERENCES
        </Text>

        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.cardBorder,
          }}
          className="mb-6 overflow-hidden rounded-2xl border"
        >
          <TouchableOpacity
            style={{ borderColor: COLORS.cardBorder }}
            className="flex-row min-h-[52px] items-center justify-between border-b p-4 active:opacity-80"
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <User size={18} color={COLORS.textMuted} />
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
                numberOfLines={1}
              >
                Account Details
              </Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ borderColor: COLORS.cardBorder }}
            className="flex-row min-h-[52px] items-center justify-between border-b p-4 active:opacity-80"
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <Shield size={18} color={COLORS.textMuted} />
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
                numberOfLines={1}
              >
                Security Credentials
              </Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row min-h-[52px] items-center justify-between p-4 active:opacity-80">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <Bell size={18} color={COLORS.textMuted} />
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                className="text-sm"
                numberOfLines={1}
              >
                Notifications
              </Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Terminate Session CTA */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: `${COLORS.danger}10`,
            borderColor: `${COLORS.danger}40`,
          }}
          className="flex-row min-h-[52px] items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-80"
        >
          <LogOut size={18} color={COLORS.danger} />
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