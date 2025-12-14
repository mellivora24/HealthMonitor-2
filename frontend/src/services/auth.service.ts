import { authApi } from '../api';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../utils/constants';
import { LoginRequest, RegisterRequest, User } from '../types';

export class AuthService {
    static async login(data: LoginRequest): Promise<User> {
        const response = await authApi.login(data);
        await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        await StorageService.setItem(STORAGE_KEYS.USER_DATA, response.user);
        return response.user;
    }

    static async register(data: RegisterRequest): Promise<User> {
        const response = await authApi.register(data);
        await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        await StorageService.setItem(STORAGE_KEYS.USER_DATA, response.user);
        return response.user;
    }

    static async logout(): Promise<void> {
        await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await StorageService.removeItem(STORAGE_KEYS.USER_DATA);
        await StorageService.removeItem(STORAGE_KEYS.DEVICE_CODE);
    }

    static async getToken(): Promise<string | null> {
        return await StorageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    }

    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        if (!token) return false;
        return true;
    }

    static async getCurrentUser(): Promise<User | null> {
        return await StorageService.getItem<User>(STORAGE_KEYS.USER_DATA);
    }

    static async updateStoredUser(user: User): Promise<void> {
        await StorageService.setItem(STORAGE_KEYS.USER_DATA, user);
    }
}
