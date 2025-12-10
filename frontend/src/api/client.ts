import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';
import { ApiError, ApiResponse } from '../types';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.client.interceptors.request.use(
            async (config) => {
                const token = await storage.get<string>(STORAGE_KEYS.TOKEN);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ApiResponse>) => {
                if (error.response?.status === 401) {
                    await storage.remove(STORAGE_KEYS.TOKEN);
                    await storage.remove(STORAGE_KEYS.USER);
                }

                const apiError: ApiError = {
                    message: error.response?.data?.message || error.message || 'An error occurred',
                    status: error.response?.status,
                };

                return Promise.reject(apiError);
            }
        );
    }

    async get<T>(url: string, params?: any): Promise<T> {
        const response = await this.client.get<ApiResponse<T>>(url, { params });
        return response.data.data as T;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.post<ApiResponse<T>>(url, data);
        return response.data.data as T;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.put<ApiResponse<T>>(url, data);
        return response.data.data as T;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<ApiResponse<T>>(url);
        return response.data.data as T;
    }
}

export const apiClient = new ApiClient();
