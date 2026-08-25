import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/theme';
import { showToast } from '../../src/config/toastConfig';

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('INDIA');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || !region) {
      showToast.error('MISSING_DATA', 'Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        region: region.trim(),
      });
      showToast.success('ACCOUNT_CREATED', 'Identity successfully initialized.');
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      showToast.error('REGISTRATION_FAILED', msg);
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
                INITIALIZE_ACCOUNT
              </Text>
              <Text className="mt-1 font-orbitron-black text-2xl font-bold" style={{ color: COLORS.textMain }}>
                CREATE <Text style={{ color: COLORS.primary }}>IDENTITY</Text>
              </Text>
              <Text className="mt-1.5 text-center font-rajdhani text-sm" style={{ color: COLORS.textMuted }}>
                Join the network to compete and track statistics.
              </Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-3">
              <View>
                <Text className="mb-1 font-rajdhani-bold text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                  Username
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="admin"
                  placeholderTextColor="#52525B"
                  autoCapitalize="none"
                  className="w-full rounded-xl border px-4 py-2.5 font-rajdhani font-semibold text-white"
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                />
              </View>

              <View className="mt-2">
                <Text className="mb-1 font-rajdhani-bold text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="rudra@admin.com"
                  placeholderTextColor="#52525B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full rounded-xl border px-4 py-2.5 font-rajdhani font-semibold text-white"
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                />
              </View>

              <View className="mt-2">
                <Text className="mb-1 font-rajdhani-bold text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#52525B"
                  secureTextEntry
                  className="w-full rounded-xl border px-4 py-2.5 font-rajdhani font-semibold text-white"
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                />
              </View>

              <View className="mt-2">
                <Text className="mb-1 font-rajdhani-bold text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                  Region
                </Text>
                <TextInput
                  value={region}
                  onChangeText={setRegion}
                  placeholder="INDIA"
                  placeholderTextColor="#52525B"
                  autoCapitalize="characters"
                  className="w-full rounded-xl border px-4 py-2.5 font-rajdhani font-semibold text-white"
                  style={{ backgroundColor: COLORS.inputBg, borderColor: COLORS.cardBorder }}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className="mt-6 w-full items-center justify-center rounded-xl py-3.5 active:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} size="small" />
              ) : (
                <Text className="font-orbitron text-xs font-bold uppercase" style={{ color: COLORS.background }}>
                  SIGN UP
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer Navigation */}
            <View className="mt-5 flex-row justify-center gap-1">
              <Text className="font-rajdhani text-sm" style={{ color: COLORS.textMuted }}>
                Already registered?
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="font-rajdhani-bold text-sm font-bold" style={{ color: COLORS.primary }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}