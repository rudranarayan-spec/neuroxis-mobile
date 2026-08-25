export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  streakFreezeCount: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  region: string;
  globalElo: number;
  xp: number;
  level: number;
  streak: UserStreak;
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
