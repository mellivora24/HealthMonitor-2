import { useState } from 'react';
import { healthDataApi } from '../api';

export const useHealthData = () => {
    const [latestData, setLatestData] = useState<any>(null);

    const fetchLatest = async () => {
        try {
            const res = await healthDataApi.getLatest();
            setLatestData(res);
        } catch (e) {
            console.error('fetchLatest error', e);
        }
    };

    return {
        latestData,
        setLatestData, // 👈 WS SẼ DÙNG
        fetchLatest,
    };
};
