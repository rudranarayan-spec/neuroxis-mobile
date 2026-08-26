export type TimeframeFilter = 'TODAY' | '7_DAYS' | '30_DAYS' | 'ALL_TIME';

export interface DashboardStats {
  username: string;
  level: number;
  totalXp: number;
  rankTitle: string;
  rankPercentile: string;
  mmrRating: number;
  winRate: string;
  winStreak: string;
  liveArenasJoined: number;
  winLossRatio: string;
  totalMatches: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}