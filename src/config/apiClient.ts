import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { accent, logger } from '@rudranarayan01/logaccent';
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

// Request Interceptor: Attach bearer token & log outgoing request details
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toUpperCase() || 'GET';
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;

    // Log HTTP Request
    logger.info(`[API REQUEST] ${method} -> ${fullUrl}`);
    if (config.data) {
      console.log(accent.cyan(`Payload: ${JSON.stringify(config.data, null, 2)}`));
    }

    return config;
  },
  (error) => {
    logger.error(`[API REQUEST ERROR] ${error.message}`);
    return Promise.reject(error);
  }
);

// Response Interceptor: Log API response details & handle global errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const method = response.config.method?.toUpperCase() || 'GET';
    const url = response.config.url || '';
    const status = response.status;

    // Log HTTP Success Response
    logger.success(`[API RESPONSE] ${status} ${method} -> ${url}`);
    console.log(accent.green(`Data: ${JSON.stringify(response.data, null, 2)}`));

    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';
    const errorData = error.response?.data || error.message;

    // Log HTTP Failure
    logger.error(`[API ERROR] ${status || 'NET_ERR'} ${method} -> ${url}`);
    console.log(accent.red(`Details: ${JSON.stringify(errorData, null, 2)}`));

    if (status === 401) {
      logger.warn('[AUTH] Token expired or invalid. Removing credentials...');
      await tokenStorage.removeToken();
    }

    return Promise.reject(error);
  }
);