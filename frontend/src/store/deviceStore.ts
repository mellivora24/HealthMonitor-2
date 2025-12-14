import { create } from 'zustand';
import { Device } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';
import { deviceApi } from '../api';

interface DeviceState {
    devices: Device[];
    activeDevice: Device | null;
    deviceCode: string | null;

    setDevices: (devices: Device[]) => void;
    fetchDevices: () => Promise<void>;
    setDeviceCode: (code: string) => Promise<void>;
    loadDeviceCode: () => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
    devices: [],
    activeDevice: null,
    deviceCode: null,

    setDevices: (devices) => {
        const activeDevice =
            devices.find(d => d.is_active && d.is_assigned) || null;

        set({
            devices,
            activeDevice,
            deviceCode: activeDevice?.device_code || null,
        });
    },

    fetchDevices: async () => {
        const devices = await deviceApi.getUserDevices();
        set((state) => {
            const active =
                devices.find(d => d.is_active && d.is_assigned) || null;

            if (active) {
                storage.set(STORAGE_KEYS.DEVICE_CODE, active.device_code);
            }

            return {
                devices,
                activeDevice: active,
                deviceCode: active?.device_code || state.deviceCode,
            };
        });
    },

    setDeviceCode: async (code) => {
        await storage.set(STORAGE_KEYS.DEVICE_CODE, code);
        set({ deviceCode: code });
    },

    loadDeviceCode: async () => {
        const code = await storage.get<string>(STORAGE_KEYS.DEVICE_CODE);
        set({ deviceCode: code });
    },
}));
