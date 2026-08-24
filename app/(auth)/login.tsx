import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CyberInput } from '../../src/components/CyberInput';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
        {/* Branding */}
        <View className="mb-8">
          <Text className="font-orbitron-black text-3xl font-bold text-text-main">
            MATIKS <Text className="text-accentGreen">GAMING</Text>
          </Text>
          <Text className="mt-1 font-rajdhani text-sm text-text-muted">
            Enter your credentials to access your player profile
          </Text>
        </View>

        {/* Form Card */}
        <View className="rounded-2xl border border-cardBorder bg-card p-5">
          {error ? (
            <View className="mb-4 rounded-xl bg-red-500/10 p-3 border border-red-500/20">
              <Text className="font-rajdhani text-xs text-red-400">{error}</Text>
            </View>
          ) : null}

          <CyberInput
            label="Email Address"
            placeholder="player@domain.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CyberInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="mt-2 items-center justify-center rounded-xl bg-accentGreen py-3.5 active:opacity-90"
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="font-orbitron text-xs font-bold text-background">LOG IN</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View className="mt-6 flex-row justify-center">
          <Text className="font-rajdhani text-sm text-text-muted">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="font-rajdhani-bold text-sm text-accentGreen">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}