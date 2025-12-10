import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/login', data);
    },

    register: async (data: RegisterRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/register', data);
    },
};
