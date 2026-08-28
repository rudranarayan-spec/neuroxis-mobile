import '../global.css';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron';
import { Rajdhani_500Medium, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { CustomSplashScreen } from '../src/components/SplashScreen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ConfirmProvider } from '../src/context/ConfirmContext';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading, navigationState?.key]);

  if (isLoading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#B5F23D" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="matchmaking" 
        options={{ presentation: 'fullScreenModal', animation: 'fade' }} 
      />
      <Stack.Screen 
        name="game-overview" 
        options={{ animation: 'slide_from_right' }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);

  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
    Orbitron_900Black,
    Rajdhani_500Medium,
    Rajdhani_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider style={{ backgroundColor: '#000000' }}>
        <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#B5F23D" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: '#000000' }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfirmProvider>
            <StatusBar style="light" backgroundColor="#000000" translucent />
            <View style={{ flex: 1, backgroundColor: '#000000' }}>
              <InitialLayout />
              {!splashFinished && (
                <View className="absolute inset-0 z-50 bg-[#000000]">
                  <CustomSplashScreen onFinish={() => setSplashFinished(true)} />
                </View>
              )}
            </View>
          </ConfirmProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}