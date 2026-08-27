import { apiClient } from "../config/apiClient";
import {
  GetPuzzleResponse,
  StartGameResponse,
  SubmitGameResponse,
  Difficulty,
  AbandonGameResponse,
  SubmitGamePayload,
  StartGamePayload,
} from "../types/games.types";

export const gameApi = {
  getPuzzle: async (
    gameId: string = "sudoku",
    difficulty: Difficulty = "EASY",
    gridSize: number = 6,
  ): Promise<GetPuzzleResponse> => {
    const response = await apiClient.get<GetPuzzleResponse>(
      `/game/${gameId}/puzzles`,
      {
        params: { difficulty, gridSize },
      },
    );
    return response.data;
  },

  // Accepts dynamic parameters for sequence games as well as puzzle games
  startGame: async (
    payload: StartGamePayload,
  ): Promise<StartGameResponse> => {
    const response = await apiClient.post<StartGameResponse>("/game/start", payload);
    return response.data;
  },

  submitGame: async (
    payload: SubmitGamePayload,
  ): Promise<SubmitGameResponse> => {
    const response = await apiClient.post<SubmitGameResponse>(
      "/game/submit",
      payload,
    );
    return response.data;
  },

  abandonGame: async (
    sessionId: string,
    durationInSeconds: number,
  ): Promise<AbandonGameResponse> => {
    const response = await apiClient.patch<AbandonGameResponse>(
      `/game/session/${sessionId}/abandon`,
      { durationInSeconds },
    );
    return response.data;
  },
};