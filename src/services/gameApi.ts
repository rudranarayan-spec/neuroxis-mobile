import { apiClient } from '../config/apiClient';
import {
  GetPuzzleResponse,
  StartGameResponse,
  SubmitGameResponse,
  Difficulty,
} from '../types/games.types';

export const gameApi = {
  getPuzzle: async (
    gameId: string = 'sudoku',
    difficulty: Difficulty = 'EASY',
    gridSize: number = 6
  ): Promise<GetPuzzleResponse> => {
    const response = await apiClient.get<GetPuzzleResponse>(`/game/${gameId}/puzzles`, {
      params: { difficulty, gridSize },
    });
    return response.data;
  },

  startGame: async (gameId: string, puzzleId: string): Promise<StartGameResponse> => {
    const response = await apiClient.post<StartGameResponse>('/game/start', {
      gameId,
      puzzleId,
    });
    return response.data;
  },

  submitGame: async (
    sessionId: string,
    userBoard: number[][],
    clientTimeElapsed: number
  ): Promise<SubmitGameResponse> => {
    const response = await apiClient.post<SubmitGameResponse>('/game/submit', {
      sessionId,
      userBoard,
      clientTimeElapsed,
    });
    return response.data;
  },
};