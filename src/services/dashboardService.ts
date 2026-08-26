import { apiClient } from '../config/apiClient';
import { DashboardStatsResponse, TimeframeFilter } from '../types/dashboard';

export const dashboardService = {
  getDashboardStats: async (timeframe: TimeframeFilter = 'ALL_TIME') => {
    const response = await apiClient.get<DashboardStatsResponse>('/users/dashboard-stats', {
      params: { timeframe },
    });
    return response.data;
  },
};