import { apiClient } from '../config/apiClient';
import { UserProfileResponse } from '../types/profile';

export const profileService = {
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/profile');
    return response.data;
  },
};