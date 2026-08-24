import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth credentials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Replace this logic with your backend API call if needed
    const mockUser: User = { id: '1', username: email.split('@')[0], email };
    const mockToken = 'mock-jwt-token';

    setToken(mockToken);
    setUser(mockUser);
    await SecureStore.setItemAsync('userToken', mockToken);
    await SecureStore.setItemAsync('userData', JSON.stringify(mockUser));
  };

  const register = async (username: string, email: string, password: string) => {
    // Replace this logic with your backend API call if needed
    const mockUser: User = { id: Date.now().toString(), username, email };
    const mockToken = 'mock-jwt-token';

    setToken(mockToken);
    setUser(mockUser);
    await SecureStore.setItemAsync('userToken', mockToken);
    await SecureStore.setItemAsync('userData', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};