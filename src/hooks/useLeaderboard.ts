import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../services/leaderboardService';
import { LeaderboardQueryParams } from '../types/leaderboard';

export const LEADERBOARD_KEYS = {
  all: ['leaderboard'] as const,
  list: (params: LeaderboardQueryParams) => [...LEADERBOARD_KEYS.all, 'list', params] as const,
  myRank: (type: string, filter: string) => [...LEADERBOARD_KEYS.all, 'me', type, filter] as const,
};

export const useLeaderboard = (params: LeaderboardQueryParams) => {
  return useQuery({
    queryKey: LEADERBOARD_KEYS.list(params),
    queryFn: () => leaderboardApi.fetchLeaderboard(params),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export const useMyRank = (type: string = 'global', filter: string = '') => {
  return useQuery({
    queryKey: LEADERBOARD_KEYS.myRank(type, filter),
    queryFn: () => leaderboardApi.fetchMyRank(type, filter),
    staleTime: 1000 * 60 * 2,
  });
};