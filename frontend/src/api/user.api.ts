import { apiClient } from './client';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../types';

export const userApi = {
    getProfile: async (): Promise<User> => {
        return apiClient.get<User>('/users/profile');
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        return apiClient.put<User>('/users/profile', data);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        return apiClient.post<void>('/users/change-password', data);
    },
};
