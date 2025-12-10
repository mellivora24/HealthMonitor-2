import { apiClient } from './client';
import {
    Alert,
    GetAlertsRequest,
    PaginatedAlertsResponse,
    MarkReadRequest,
    AlertStats,
} from '../types';

export const alertApi = {
    getAlerts: async (params?: GetAlertsRequest): Promise<PaginatedAlertsResponse> => {
        return apiClient.get<PaginatedAlertsResponse>('/alerts', params);
    },

    getStats: async (): Promise<AlertStats> => {
        return apiClient.get<AlertStats>('/alerts/stats');
    },

    markAsRead: async (data: MarkReadRequest): Promise<void> => {
        return apiClient.post<void>('/alerts/mark-read', data);
    },

    deleteAlert: async (alertId: string): Promise<void> => {
        return apiClient.delete<void>(`/alerts/${alertId}`);
    },

    deleteMultiple: async (alertIds: string[]): Promise<void> => {
        return apiClient.post<void>('/alerts/delete-multiple', { ids: alertIds });
    },
};
