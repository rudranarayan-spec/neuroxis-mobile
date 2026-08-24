import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CyberInput } from '../../src/components/CyberInput';
import { CyberButton } from '../../src/components/CyberButton';
import { useAuth } from '../../src/context/AuthContext';
import { authService, LoginPayload } from '../../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('AdminPass');

  // TanStack Query Login Mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginPayload) => authService.login(credentials),
    onSuccess: async (data) => {
      await login(data.token, data.user);
      router.replace('/(tabs)');
    },
    onError: (error: Error) => {
      Alert.alert('Authentication Failed', error.message);
    },
  });

  const handleLogin = () => {
    loginMutation.mutate({ email, passcode: password });
  };

  return (
    <ScreenContainer className="px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1}} showsVerticalScrollIndicator={false}>
        <View className="mb-8 pt-8">
          <Text className="font-rajdhani-bold text-xs uppercase tracking-[0.3em] text-neon-light">
            SECURITY_CHECK // AUTH
          </Text>
          <Text className="mt-1 font-orbitron-black text-3xl text-white">
            ACCESS <Text className="text-neon">TERMINAL</Text>
          </Text>
          <Text className="mt-2 font-rajdhani text-sm text-text-muted">
            Enter admin credentials to link to the Neural Arena.
          </Text>
        </View>

        <CyberInput
          label="Operative Email"
          placeholder="admin@admin.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <CyberInput
          label="Passcode"
          placeholder="AdminPass"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity className="mb-6 align-self-end">
          <Text className="font-rajdhani-bold text-xs uppercase text-neon">
            Forgot Passcode?
          </Text>
        </TouchableOpacity>

        <CyberButton
          title="Authenticate"
          isLoading={loginMutation.isPending}
          onPress={handleLogin}
        />

        <View className="mt-6 flex-row justify-center pb-8">
          <Text className="font-rajdhani text-sm text-text-muted">New Operative? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="font-rajdhani-bold text-sm text-neon">Initialize Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}