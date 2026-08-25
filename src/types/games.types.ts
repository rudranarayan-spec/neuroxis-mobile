export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Puzzle {
  _id: string;
  gameId: string;
  difficulty: Difficulty;
  gridSize: number;
  board: number[][];
}

export interface GetPuzzleResponse {
  success: boolean;
  puzzle: Puzzle;
  message?: string;
}

export interface StartGameResponse {
  success: boolean;
  sessionId: string;
  startTime: string;
}

export interface SubmitGameResponse {
  success: boolean;
  message: string;
  xpEarned: number;
  durationInSeconds: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface HistoryStep {
  row: number;
  col: number;
  previousValue: number;
  newValue: number;
}