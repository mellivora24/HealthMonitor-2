import { create } from 'zustand';
import { HealthData, ChartDataPoint, HealthDataStats } from '../types';

interface HealthState {
    latestData: HealthData | null;
    chartData: ChartDataPoint[];
    stats: HealthDataStats | null;

    setLatestData: (data: HealthData) => void;
    setChartData: (data: ChartDataPoint[]) => void;
    setStats: (stats: HealthDataStats) => void;
    updateRealtimeData: (data: Partial<HealthData>) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
    latestData: null,
    chartData: [],
    stats: null,

    setLatestData: (data: HealthData) => set({ latestData: data }),

    setChartData: (data: ChartDataPoint[]) => set({ chartData: data }),

    setStats: (stats: HealthDataStats) => set({ stats }),

    updateRealtimeData: (data: Partial<HealthData>) =>
        set((state) => ({
            latestData: state.latestData
                ? { ...state.latestData, ...data, created_at: new Date().toISOString() }
                : null,
        })),
}));