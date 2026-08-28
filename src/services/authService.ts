import { apiClient } from "../config/apiClient";
import {
  AuthResponse,
  GetMeResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<GetMeResponse>("/users/me");
    const userData = response.data.data.user;

    return {
      ...userData,
      id: userData._id || userData.id,
    };
  },
};
