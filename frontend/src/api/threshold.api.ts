import { apiClient } from './client';
import { HealthThreshold, UpdateThresholdRequest } from '../types';

export const thresholdApi = {
    getThreshold: async (): Promise<HealthThreshold> => {
        return apiClient.get<HealthThreshold>('/thresholds');
    },

    updateThreshold: async (data: UpdateThresholdRequest): Promise<HealthThreshold> => {
        return apiClient.put<HealthThreshold>('/thresholds', data);
    },
};
