export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ShikakuRect {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

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

export interface StartGamePayload {
  gameId: string;
  puzzleId?: string;          
  sequenceLength?: number;    
  gridSize?: number;           
}

export interface StartGameResponse {
  success: boolean;
  sessionId: string;
  startTime: string;
  sequence?: number[];          // Returned for Echo Pattern sessions
}

export interface SubmitGameResponse {
  success: boolean;
  message: string;
  xpEarned: number;
  durationInSeconds: number;
  currentStreak?: number;
}

// Updated Payload supporting Sudoku (userBoard), Shikaku (rects), and Echo Pattern (userSequence)
export interface SubmitGamePayload {
  sessionId: string;
  userBoard?: number[][];
  rects?: ShikakuRect[];
  userSequence?: number[];     // Added for Echo Pattern tap validation
  clientTimeElapsed: number;
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

export interface AbandonGameResponse {
  message: string;
  session: {
    _id: string;
    userId: string;
    gameId: string;
    puzzleId?: string;
    status: 'ABANDONED';
    startTime: string;
    endTime: string;
    durationInSeconds: number;
    xpEarned: number;
  };
}