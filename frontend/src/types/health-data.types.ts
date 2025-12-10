export interface HealthData {
    id: string;
    user_id: string;
    device_id: string;
    heart_rate?: number;
    spo2?: number;
    body_temperature?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    accel_x?: number;
    accel_y?: number;
    accel_z?: number;
    created_at: string;
}

export interface GetHealthDataRequest {
    device_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
}

export interface PaginatedHealthDataResponse {
    data: HealthData[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface HealthDataStats {
    avg_heart_rate?: number;
    min_heart_rate?: number;
    max_heart_rate?: number;
    avg_spo2?: number;
    avg_body_temperature?: number;
    avg_blood_pressure_systolic?: number;
    avg_blood_pressure_diastolic?: number;
}

export interface ChartDataPoint {
    timestamp: string;
    heart_rate?: number;
    spo2?: number;
    body_temperature?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
}

export interface GetChartDataRequest {
    device_id?: string;
    start_date: string;
    end_date: string;
    interval?: 'minute' | 'hour' | 'day';
}

export interface RealtimeHealthPayload {
    device_code: string;
    heart_rate?: number;
    spo2?: number;
    body_temperature?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    accel_x?: number;
    accel_y?: number;
    accel_z?: number;
}

export interface RealtimeAlertPayload {
    id: string;
    user_id: string;
    alert_type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}
