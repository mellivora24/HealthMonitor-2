import { useState, useEffect } from 'react';
import { alertApi } from '../api';
import { useAlertStore } from '../store/alertStore';
import { GetAlertsRequest } from '../types';

export const useAlerts = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { alerts, unreadCount, setAlerts, markAsRead, removeAlert, removeAlerts } = useAlertStore();

    const fetchAlerts = async (params?: GetAlertsRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await alertApi.getAlerts(params);
            setAlerts(response.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const markAlertsAsRead = async (alertIds: string[]) => {
        try {
            await alertApi.markAsRead({ alert_ids: alertIds });
            markAsRead(alertIds);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteAlert = async (alertId: string) => {
        try {
            await alertApi.deleteAlert(alertId);
            removeAlert(alertId);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteMultipleAlerts = async (alertIds: string[]) => {
        try {
            await alertApi.deleteMultiple(alertIds);
            removeAlerts(alertIds);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    return {
        alerts,
        unreadCount,
        isLoading,
        error,
        fetchAlerts,
        markAlertsAsRead,
        deleteAlert,
        deleteMultipleAlerts,
    };
};