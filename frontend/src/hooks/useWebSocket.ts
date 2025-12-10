import { useEffect, useRef, useState } from 'react';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';
import { WebSocketMessage, RealtimeHealthPayload, RealtimeAlertPayload } from '../types';
import { useHealthStore } from '../store/healthStore';
import { useAlertStore } from '../store/alertStore';

export const useWebSocket = () => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateRealtimeData = useHealthStore((state) => state.updateRealtimeData);
    const addAlert = useAlertStore((state) => state.addAlert);

    const connect = async () => {
        try {
            const token = await storage.get<string>(STORAGE_KEYS.TOKEN);
            if (!token) return;

            ws.current = new WebSocket(`${API_CONFIG.WS_URL}?token=${token}`);

            ws.current.onopen = () => {
                setIsConnected(true);
                console.log('WebSocket connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);

                    if (message.topic === 'health_data') {
                        const payload = message.payload as RealtimeHealthPayload;
                        updateRealtimeData({
                            heart_rate: payload.heart_rate,
                            spo2: payload.spo2,
                            body_temperature: payload.body_temperature,
                            blood_pressure_systolic: payload.bp_systolic,
                            blood_pressure_diastolic: payload.bp_diastolic,
                            accel_x: payload.accel_x,
                            accel_y: payload.accel_y,
                            accel_z: payload.accel_z,
                        });
                    } else if (message.topic === 'alert') {
                        const payload = message.payload as RealtimeAlertPayload;
                        addAlert(payload);
                    }
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                console.log('WebSocket disconnected');

                reconnectTimeout.current = setTimeout(() => {
                    connect();
                }, 5000);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    };

    const disconnect = () => {
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        setIsConnected(false);
    };

    useEffect(() => {
        connect();
        return () => disconnect();
    }, []);

    return { isConnected, reconnect: connect };
};