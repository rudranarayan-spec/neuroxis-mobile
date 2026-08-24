export interface DashboardMetrics {
  rank: string;
  mmr: number;
  winRate: number;
  activeTournament: string;
  liveMatchesCount: number;
  dailyStreak: number;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      rank: 'CYBER_LEGEND III',
      mmr: 2840,
      winRate: 68.5,
      activeTournament: 'NEURAL_CHAMPIONSHIP_SEASON_4',
      liveMatchesCount: 14,
      dailyStreak: 7,
    };
  },
  
};