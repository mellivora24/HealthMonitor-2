export interface Device {
    id: string;
    user_id?: string;
    device_code: string;
    device_name?: string;
    is_active: boolean;
    is_assigned: boolean;
    created_at: string;
}

export interface CreateDeviceRequest {
    device_code: string;
    device_name?: string;
}

export interface AssignDeviceRequest {
    device_code: string;
}

export interface UpdateDeviceRequest {
    device_name?: string;
    is_active?: boolean;
}
