import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach bearer token automatically
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g., token expiration)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear expired token on unauthorized responses
      await tokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);