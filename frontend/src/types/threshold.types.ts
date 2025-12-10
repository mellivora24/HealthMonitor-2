export interface HealthThreshold {
    id: string;
    user_id: string;
    heart_rate_min: number;
    heart_rate_max: number;
    spo2_min: number;
    body_temp_min: number;
    body_temp_max: number;
    bp_systolic_min: number;
    bp_systolic_max: number;
    bp_diastolic_min: number;
    bp_diastolic_max: number;
    updated_at: string;
}

export interface UpdateThresholdRequest {
    heart_rate_min?: number;
    heart_rate_max?: number;
    spo2_min?: number;
    body_temp_min?: number;
    body_temp_max?: number;
    bp_systolic_min?: number;
    bp_systolic_max?: number;
    bp_diastolic_min?: number;
    bp_diastolic_max?: number;
}
