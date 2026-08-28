export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  streakFreezeCount: number;
}

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  xp?: number;
  level?: number;
  globalElo?: number;
  region?: string;
  district?: string;
  [key: string]: any;
}

export interface GetMeResponse {
  success: boolean;
  data: {
    user: User;
    rank: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  region: string;
  username: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
