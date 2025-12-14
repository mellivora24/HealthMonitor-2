import { apiClient } from './client';
import { ApiResponse, HealthData } from '../types';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { ChartDataPoint } from '../types/health-data.types';

export const healthDataApi = {
    getLatest: async (): Promise<HealthData | null> => {
        try {
            return await apiClient.get<HealthData>('/health-data/latest');
        } catch {
            return null;
        }
    },
    getPaginated: async (params: {
        page: number;
        limit: number;
    }): Promise<{
        data: HealthData[];
        total_pages: number;
    }> => {
        try {
            const res = await apiClient.get<any>('/health-data', params);

            if (!res || !Array.isArray(res.data)) {
                return { data: [], total_pages: 1 };
            }

            return {
                data: res.data,
                total_pages: res.total_pages || 1,
            };
        } catch (e) {
            console.error('Error fetching paginated health data:', e);
            return { data: [], total_pages: 1 };
        }
    },
    getChartData: async (params: { start_date: string; end_date: string }) => {
        try {
            // Gọi API với params phẳng
            const res = await apiClient.get<any>('/health-data/chart', {
                start_date: params.start_date,
                end_date: params.end_date,
            });

            // Check null và validate response
            if (!res || !Array.isArray(res.data)) {
                console.warn('Chart data response is empty or invalid', res);
                return [];
            }

            // res.data là mảng ChartDataPoint
            return res.data as ChartDataPoint[];
        } catch (e) {
            console.error('Error fetching chart data:', e);
            return [];
        }
    },
};
