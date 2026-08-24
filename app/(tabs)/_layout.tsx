import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Custom Matiks-Style Icons
const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArenaIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m10 13-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m14 13 2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WalletIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Rect x="2" y="5" width="20" height="14" rx="3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#05070B', // Matiks Deep OLED Black
          borderTopWidth: 1,
          borderTopColor: '#121824', // Subtle slate border
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
        },
      }}
    >
      {/* 1. HOME TAB */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <View
                className={`flex-row items-center justify-center rounded-full px-4 py-1.5 transition-all ${focused ? 'bg-[#00FF66]/10 border border-[#00FF66]/30' : 'bg-transparent'
                  }`}
              >
                <HomeIcon color={focused ? '#00FF66' : '#64748B'} focused={focused} />
                {focused && (
                  <Text className="ml-2 font-rajdhani-bold text-xs font-bold text-[#00FF66]">
                    Home
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />

      {/* 2. ARENAS TAB */}
      <Tabs.Screen
        name="arenas"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <View
                className={`flex-row items-center justify-center rounded-full px-4 py-1.5 transition-all ${focused ? 'bg-[#00FF66]/10 border border-[#00FF66]/30' : 'bg-transparent'
                  }`}
              >
                <ArenaIcon color={focused ? '#00FF66' : '#64748B'} focused={focused} />
                {focused && (
                  <Text className="ml-2 font-rajdhani-bold text-xs font-bold text-[#00FF66]">
                    Arenas
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />

      {/* 3. WALLET / ARMORY TAB */}
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <View
                className={`flex-row items-center justify-center rounded-full px-4 py-1.5 transition-all ${focused ? 'bg-[#00FF66]/10 border border-[#00FF66]/30' : 'bg-transparent'
                  }`}
              >
                <WalletIcon color={focused ? '#00FF66' : '#64748B'} focused={focused} />
                {focused && (
                  <Text className="ml-2 font-rajdhani-bold text-xs font-bold text-[#00FF66]">
                    Wallet
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />

      {/* 4. PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <View
                className={`flex-row items-center justify-center rounded-full px-4 py-1.5 transition-all ${focused ? 'bg-[#00FF66]/10 border border-[#00FF66]/30' : 'bg-transparent'
                  }`}
              >
                <ProfileIcon color={focused ? '#00FF66' : '#64748B'} focused={focused} />
                {focused && (
                  <Text className="ml-2 font-rajdhani-bold text-xs font-bold text-[#00FF66]">
                    Profile
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}