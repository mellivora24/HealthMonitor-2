import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authApi, userApi } from '../api';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    updateProfile: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login(data);
            await storage.set(STORAGE_KEYS.TOKEN, response.token);
            await storage.set(STORAGE_KEYS.USER, response.user);
            set({ token: response.token, user: response.user, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.register(data);
            await storage.set(STORAGE_KEYS.TOKEN, response.token);
            await storage.set(STORAGE_KEYS.USER, response.user);
            set({ token: response.token, user: response.user, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        await storage.remove(STORAGE_KEYS.TOKEN);
        await storage.remove(STORAGE_KEYS.USER);
        set({ user: null, token: null });
    },

    loadUser: async () => {
        set({ isLoading: true });
        try {
            const user = await userApi.getProfile();
            await storage.set(STORAGE_KEYS.USER, user);
            set({ user, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    checkAuth: async () => {
        const token = await storage.get<string>(STORAGE_KEYS.TOKEN);
        const user = await storage.get<User>(STORAGE_KEYS.USER);

        if (token && user) {
            set({ token, user });
            return true;
        }

        return false;
    },

    updateProfile: (user: User) => {
        set({ user });
        storage.set(STORAGE_KEYS.USER, user);
    },
}));