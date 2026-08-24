import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CyberInput } from '../../src/components/CyberInput';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await register(username, email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8">
          <Text className="font-orbitron-black text-3xl font-bold text-text-main">
            CREATE <Text className="text-accentGreen">ACCOUNT</Text>
          </Text>
          <Text className="mt-1 font-rajdhani text-sm text-text-muted">
            Join the arena and track your competitive progress
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
            label="Gamer Tag / Username"
            placeholder="PlayerOne"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

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
            onPress={handleRegister}
            disabled={loading}
            className="mt-2 items-center justify-center rounded-xl bg-accentGreen py-3.5 active:opacity-90"
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="font-orbitron text-xs font-bold text-background">REGISTER</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="font-rajdhani text-sm text-text-muted">Already registered? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="font-rajdhani-bold text-sm text-accentGreen">Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}