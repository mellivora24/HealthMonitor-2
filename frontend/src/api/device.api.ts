import { apiClient } from './client';
import { Device, AssignDeviceRequest } from '../types';

export const deviceApi = {
    getUserDevices: async (): Promise<Device[]> => {
        return apiClient.get<Device[]>('/devices');
    },

    assignDevice: async (data: AssignDeviceRequest): Promise<Device> => {
        return apiClient.post<Device>('/devices/assign', data);
    },

    unassignDevice: async (deviceCode: string): Promise<void> => {
        return apiClient.delete<void>(`/devices/unassign/${deviceCode}`);
    },
};
