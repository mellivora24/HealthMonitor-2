import { useState, useEffect } from 'react';
import { healthDataApi } from '../api';
import { useHealthStore } from '../store/healthStore';
import { GetChartDataRequest } from '../types';

export const useHealthData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { latestData, chartData, stats, setLatestData, setChartData, setStats } = useHealthStore();

    const fetchLatest = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await healthDataApi.getLatest();
            setLatestData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChartData = async (params: GetChartDataRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await healthDataApi.getChartData(params);
            setChartData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await healthDataApi.getStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLatest();
        fetchStats();
    }, []);

    return {
        latestData,
        chartData,
        stats,
        isLoading,
        error,
        fetchLatest,
        fetchChartData,
        fetchStats,
    };
};