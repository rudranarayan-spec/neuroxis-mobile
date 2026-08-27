export type LeaderboardCategory = 'global' | 'region' | 'district' | 'xp';

export interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  region?: string;
  district?: string;
  level: number;
  streak: number;
  score: number;
}

export interface LeaderboardPagination {
  total: number;
  page: number;
  pageCount: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardUser[];
  pagination: LeaderboardPagination;
}

export interface MyRankResponse {
  success: boolean;
  data: {
    rank: number | null;
    score: number | null;
  };
}

export interface LeaderboardQueryParams {
  type?: LeaderboardCategory;
  filter?: string;
  page?: number;
  limit?: number;
}