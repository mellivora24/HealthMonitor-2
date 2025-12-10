export const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api/v1',
    WS_URL: 'ws://localhost:8080/ws',
    TIMEOUT: 10000,
};

export const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    DEVICE_CODE: 'device_code',
};

export const ROUTES = {
    SPLASH: '/',
    WELCOME: '/welcome',
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
    HOME: '/(tabs)',
    ALERTS: '/(tabs)/alerts',
    SETTINGS: '/(tabs)/settings',
};

export const HEALTH_METRICS = {
    HEART_RATE: 'heart_rate',
    SPO2: 'spo2',
    TEMPERATURE: 'body_temperature',
    BLOOD_PRESSURE: 'blood_pressure',
} as const;
