import { create } from 'zustand';
import { Device } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';

interface DeviceState {
    devices: Device[];
    activeDevice: Device | null;
    deviceCode: string | null;

    setDevices: (devices: Device[]) => void;
    setActiveDevice: (device: Device | null) => void;
    setDeviceCode: (code: string) => Promise<void>;
    loadDeviceCode: () => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
    devices: [],
    activeDevice: null,
    deviceCode: null,

    setDevices: (devices: Device[]) => {
        const activeDevice = devices.find(d => d.is_active && d.is_assigned) || null;
        set({ devices, activeDevice });
    },

    setActiveDevice: (device: Device | null) => set({ activeDevice: device }),

    setDeviceCode: async (code: string) => {
        await storage.set(STORAGE_KEYS.DEVICE_CODE, code);
        set({ deviceCode: code });
    },

    loadDeviceCode: async () => {
        const code = await storage.get<string>(STORAGE_KEYS.DEVICE_CODE);
        set({ deviceCode: code });
    },
}));