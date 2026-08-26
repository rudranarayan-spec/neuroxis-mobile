// services/userApi.ts
import { apiClient } from '../config/apiClient';
import { DashboardStats } from '../types/dashboard';

export const userApi = {
  getDashboardStats: async (timeframe: string): Promise<DashboardStats> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      '/user/dashboard-stats',
      { params: { timeframe } }
    );
    return response.data.data;
  },
};