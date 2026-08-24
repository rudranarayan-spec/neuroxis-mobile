import '../global.css';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron';
import { Rajdhani_500Medium, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { CustomSplashScreen } from '../src/components/SplashScreen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Verify that the navigation container is fully initialized
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait until both Auth state is loaded AND Navigation container is mounted
    if (isLoading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading, navigationState?.key]);

  if (isLoading || !navigationState?.key) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#00FF66" />
      </View>
    );
  }

  return <Slot />;
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
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#00FF66" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#090D16" translucent />
          <View className="flex-1 bg-background">
            {!splashFinished ? (
              <CustomSplashScreen onFinish={() => setSplashFinished(true)} />
            ) : (
              <InitialLayout />
            )}
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}