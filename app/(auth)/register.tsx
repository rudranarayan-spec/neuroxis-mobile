import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CyberInput } from '../../src/components/CyberInput';
import { CyberButton } from '../../src/components/CyberButton';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Registration Error', 'All field parameters are required.');
      return;
    }

    setLoading(true);
    try {
      // API call simulation
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockToken = 'mock_jwt_token_987654';
      const mockUser = { id: 'usr_02', username, email };

      await login(mockToken, mockUser);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Registration Failed', 'Could not establish connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8">
          <Text className="font-rajdhani-bold text-xs uppercase tracking-[0.3em] text-neon-light">
            NEW_PROFILE // REGISTRATION
          </Text>
          <Text className="mt-1 font-orbitron-black text-3xl text-white">
            JOIN <Text className="text-neon">NEUROXIS</Text>
          </Text>
          <Text className="mt-2 font-rajdhani text-sm text-text-muted">
            Create your cyber operative profile to begin competing.
          </Text>
        </View>

        {/* Inputs */}
        <CyberInput
          label="Codename / Handle"
          placeholder="NEON_GHOST"
          value={username}
          onChangeText={setUsername}
        />

        <CyberInput
          label="Operative Email"
          placeholder="agent@neuroxis.io"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <CyberInput
          label="Passcode"
          placeholder="••••••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <CyberButton title="Create Operative Profile" isLoading={loading} onPress={handleRegister} className="mt-2" />

        {/* Login Link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="font-rajdhani text-sm text-text-muted">Already registered? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="font-rajdhani-bold text-sm text-neon">Access Terminal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}