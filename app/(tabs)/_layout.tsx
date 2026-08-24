import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Custom Tab Item Container for smooth visual active indicator state
const TabItem = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => (
  <View className="items-center justify-center">
    <View
      className={`h-10 w-12 items-center justify-center rounded-xl transition-all ${
        focused ? 'bg-[#B5F23D]/10 border border-[#B5F23D]/20' : 'bg-transparent'
      }`}
    >
      {children}
    </View>
  </View>
);

const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArenaIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m10 13-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m14 13 2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WalletIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Rect x="2" y="5" width="20" height="14" rx="3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8}>
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Safe bottom padding spacing across device viewports
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#B5F23D',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopWidth: 1,
          borderTopColor: '#2C2C2E',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          position: 'absolute',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabItem focused={focused}>
              <HomeIcon color={color} focused={focused} />
            </TabItem>
          ),
        }}
      />

      <Tabs.Screen
        name="arenas"
        options={{
          title: 'Arenas',
          tabBarIcon: ({ color, focused }) => (
            <TabItem focused={focused}>
              <ArenaIcon color={color} focused={focused} />
            </TabItem>
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <TabItem focused={focused}>
              <WalletIcon color={color} focused={focused} />
            </TabItem>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabItem focused={focused}>
              <ProfileIcon color={color} focused={focused} />
            </TabItem>
          ),
        }}
      />
    </Tabs>
  );
}