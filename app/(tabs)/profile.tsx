import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
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
    <ScreenContainer className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* User Card */}
        <View className="mb-6 items-center pt-2">
          <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-[#00FF66] bg-[#0B101B]">
            <Text className="font-orbitron-black text-2xl font-bold text-[#00FF66]">
              {user?.username?.substring(0, 2).toUpperCase() || 'P1'}
            </Text>
          </View>
          <Text className="mt-3 font-orbitron-black text-xl font-bold text-white">
            {user?.username || 'Player One'}
          </Text>
          <Text className="font-rajdhani text-xs text-slate-400">{user?.email || 'player@game.com'}</Text>
        </View>

        {/* Account Options */}
        <View className="mb-6 rounded-2xl border border-[#121824] bg-[#0B101B] p-2">
          <TouchableOpacity className="flex-row items-center justify-between border-b border-[#121824] p-3.5">
            <Text className="font-rajdhani-bold text-sm font-semibold text-white">Account Settings</Text>
            <Text className="font-rajdhani text-xs text-slate-500">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between border-b border-[#121824] p-3.5">
            <Text className="font-rajdhani-bold text-sm font-semibold text-white">Security & Password</Text>
            <Text className="font-rajdhani text-xs text-slate-500">Protected</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between p-3.5">
            <Text className="font-rajdhani-bold text-sm font-semibold text-white">Notifications</Text>
            <Text className="font-rajdhani text-xs text-slate-500">On</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          onPress={handleLogout}
          className="items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 py-3.5"
        >
          <Text className="font-orbitron text-xs font-bold text-red-500">LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}