import { apiClient } from '../config/apiClient';
import { 
  LeaderboardResponse, 
  MyRankResponse, 
  LeaderboardQueryParams 
} from '../types/leaderboard';

export const leaderboardApi = {
  fetchLeaderboard: async (params: LeaderboardQueryParams): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<LeaderboardResponse>('/leaderboard', { params });
    return response.data;
  },

  fetchMyRank: async (type: string = 'global', filter: string = ''): Promise<MyRankResponse> => {
    const response = await apiClient.get<MyRankResponse>('/leaderboard/me', {
      params: { type, filter },
    });
    return response.data;
  },
};