export interface ProfileStats {
  matches: number;
  winRate: string;
  rank: string;
}

export interface UserProfileData {
  username: string;
  email: string;
  level: number;
  levelTitle: string;
  stats: ProfileStats;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfileData;
  message?: string;
}