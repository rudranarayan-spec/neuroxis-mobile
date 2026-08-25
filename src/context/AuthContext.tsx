import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '../utils/tokenStorage';
import { authService } from '../services/authService';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development logger helper
const logDevAuthAction = (action: string, data: any) => {
  if (__DEV__) {
    console.log(`\x1b[36m[AUTH DEV LOG] ---> ${action}\x1b[0m`, JSON.stringify(data, null, 2));
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();

  // Restore stored token on app launch
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await tokenStorage.getToken();
        logDevAuthAction('RESTORE_SESSION_CHECK', { hasToken: !!storedToken });
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to restore auth token:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      logDevAuthAction('LOGIN_REQUEST', { email: payload.email });
      return await authService.login(payload);
    },
    onSuccess: async (data) => {
      logDevAuthAction('LOGIN_SUCCESS', { userId: data.user.id, username: data.user.username });
      await tokenStorage.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
    },
    onError: (error: any) => {
      logDevAuthAction('LOGIN_ERROR', error.response?.data || error.message);
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      logDevAuthAction('REGISTER_REQUEST', { email: payload.email, username: payload.username });
      return await authService.register(payload);
    },
    onSuccess: async (data) => {
      logDevAuthAction('REGISTER_SUCCESS', { userId: data.user.id, username: data.user.username });
      await tokenStorage.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
    },
    onError: (error: any) => {
      logDevAuthAction('REGISTER_ERROR', error.response?.data || error.message);
    },
  });

  const login = async (payload: LoginPayload) => {
    return await loginMutation.mutateAsync(payload);
  };

  const register = async (payload: RegisterPayload) => {
    return await registerMutation.mutateAsync(payload);
  };

  const logout = async () => {
    logDevAuthAction('LOGOUT', { userId: user?.id });
    await tokenStorage.removeToken();
    setToken(null);
    setUser(null);
    queryClient.clear(); // Clear cached queries on sign out
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}