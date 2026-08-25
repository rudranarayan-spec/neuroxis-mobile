import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/theme';
import { showToast } from '../../src/config/toastConfig';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast.error('MISSING_FIELDS', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      showToast.success('AUTHENTICATED', 'Welcome back to the system.');
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid credentials or network failure.';
      showToast.error('AUTH_FAILED', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
          className="px-6 py-8"
        >
          {/* Centered Responsive Card Container */}
          <View className="w-full max-w-md rounded-2xl border p-6" style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}>
            {/* Header */}
            <View className="mb-6 items-center text-center">
              <Text className="font-rajdhani-bold text-xs uppercase tracking-[0.25em]" style={{ color: COLORS.primary }}>
                AUTHENTICATION_NODE
              </Text>
              <Text className="mt-1 font-orbitron-black text-2xl font-bold" style={{ color: COLORS.textMain }}>
                WELCOME <Text style={{ color: COLORS.primary }}>BACK</Text>
              </Text>
              <Text className="mt-1.5 text-center font-rajdhani text-sm" style={{ color: COLORS.textMuted }}>
                Enter your credentials to access active arenas.
              </Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <View>
                <Text className="mb-1.5 font-rajdhani-bold text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="rudra@admin.com"
                  placeholderTextColor="#52525B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full rounded-xl border px-4 py-3 font-rajdhani font-semibold text-white"
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                />
              </View>

              <View className="mt-3">
                <Text className="mb-1.5 font-rajdhani-bold text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#52525B"
                  secureTextEntry
                  className="w-full rounded-xl border px-4 py-3 font-rajdhani font-semibold text-white"
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="mt-6 w-full items-center justify-center rounded-xl py-3.5 active:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} size="small" />
              ) : (
                <Text className="font-orbitron text-xs font-bold uppercase" style={{ color: COLORS.background }}>
                  LOG IN
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer Navigation */}
            <View className="mt-5 flex-row justify-center gap-1">
              <Text className="font-rajdhani text-sm" style={{ color: COLORS.textMuted }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="font-rajdhani-bold text-sm font-bold" style={{ color: COLORS.primary }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}