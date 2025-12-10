import { create } from 'zustand';
import { Alert } from '../types';

interface AlertState {
    alerts: Alert[];
    unreadCount: number;

    setAlerts: (alerts: Alert[]) => void;
    addAlert: (alert: Alert) => void;
    markAsRead: (alertIds: string[]) => void;
    removeAlert: (alertId: string) => void;
    removeAlerts: (alertIds: string[]) => void;
    updateUnreadCount: (count: number) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    alerts: [],
    unreadCount: 0,

    setAlerts: (alerts: Alert[]) =>
        set({
            alerts,
            unreadCount: alerts.filter(a => !a.is_read).length,
        }),

    addAlert: (alert: Alert) =>
        set((state) => ({
            alerts: [alert, ...state.alerts],
            unreadCount: alert.is_read ? state.unreadCount : state.unreadCount + 1,
        })),

    markAsRead: (alertIds: string[]) =>
        set((state) => ({
            alerts: state.alerts.map(alert =>
                alertIds.includes(alert.id) ? { ...alert, is_read: true } : alert
            ),
            unreadCount: state.unreadCount - alertIds.length,
        })),

    removeAlert: (alertId: string) =>
        set((state) => {
            const alert = state.alerts.find(a => a.id === alertId);
            return {
                alerts: state.alerts.filter(a => a.id !== alertId),
                unreadCount: alert && !alert.is_read ? state.unreadCount - 1 : state.unreadCount,
            };
        }),

    removeAlerts: (alertIds: string[]) =>
        set((state) => {
            const removedUnreadCount = state.alerts
                .filter(a => alertIds.includes(a.id) && !a.is_read)
                .length;
            return {
                alerts: state.alerts.filter(a => !alertIds.includes(a.id)),
                unreadCount: state.unreadCount - removedUnreadCount,
            };
        }),

    updateUnreadCount: (count: number) => set({ unreadCount: count }),
}));