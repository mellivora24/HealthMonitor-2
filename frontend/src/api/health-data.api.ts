import { apiClient } from './client';
import {
    HealthData,
    GetHealthDataRequest,
    PaginatedHealthDataResponse,
    HealthDataStats,
    GetChartDataRequest,
    ChartDataPoint,
} from '../types';

export const healthDataApi = {
    getLatest: async (): Promise<HealthData> => {
        return apiClient.get<HealthData>('/health-data/latest');
    },

    getPaginated: async (params: GetHealthDataRequest): Promise<PaginatedHealthDataResponse> => {
        return apiClient.get<PaginatedHealthDataResponse>('/health-data', params);
    },

    getStats: async (): Promise<HealthDataStats> => {
        return apiClient.get<HealthDataStats>('/health-data/stats');
    },

    getChartData: async (params: GetChartDataRequest): Promise<ChartDataPoint[]> => {
        return apiClient.get<ChartDataPoint[]>('/health-data/chart', params);
    },
};
