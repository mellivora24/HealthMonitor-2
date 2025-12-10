export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8080';

export const STORAGE_KEYS = {
    AUTH_TOKEN: '@health_monitor:auth_token',
    USER_DATA: '@health_monitor:user_data',
    DEVICE_CODE: '@health_monitor:device_code',
} as const;

export const COLORS = {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
} as const;

export const ALERT_MESSAGES = {
    heart_rate: 'Nhịp tim bất thường',
    spo2: 'Nồng độ oxy trong máu thấp',
    temperature: 'Nhiệt độ cơ thể bất thường',
    blood_pressure: 'Huyết áp bất thường',
    fall_detection: 'Phát hiện ngã',
    device_offline: 'Thiết bị mất kết nối',
} as const;

export const CHART_INTERVALS = {
    minute: 'Phút',
    hour: 'Giờ',
    day: 'Ngày',
} as const;
