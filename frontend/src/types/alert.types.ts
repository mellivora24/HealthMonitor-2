export interface Alert {
    id: string;
    user_id: string;
    alert_type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface GetAlertsRequest {
    is_read?: boolean;
    alert_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
}

export interface PaginatedAlertsResponse {
    data: Alert[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface MarkReadRequest {
    alert_ids: string[];
}

export interface AlertStats {
    total_alerts: number;
    unread_alerts: number;
}

export const AlertType = {
    HEART_RATE: 'heart_rate',
    SPO2: 'spo2',
    TEMPERATURE: 'temperature',
    BLOOD_PRESSURE: 'blood_pressure',
    FALL_DETECTION: 'fall_detection',
    DEVICE_OFFLINE: 'device_offline',
} as const;
