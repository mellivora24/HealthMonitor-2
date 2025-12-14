import { useEffect, useRef, useState } from 'react';
import { websocketService } from '../services/websocket.service';

export const useWebSocket = (mcuCode?: string | null) => {
    const wsRef = useRef<WebSocket | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [healthData, setHealthData] = useState<any>(null);
    const [alertData, setAlertData] = useState<any>(null);

    useEffect(() => {
        if (!mcuCode) {
            console.warn('[WS] No mcuCode, skip connect');
            return;
        }

        let alive = true;

        const connect = async () => {
            try {
                const ws = await websocketService.connect(mcuCode);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!alive) return;
                    console.log('[WS] Connected');
                    setIsConnected(true);
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.topic === 'health_data') {
                            console.log('[WS] Updating health data:', msg.payload);
                            setHealthData({ ...msg, timestamp: Date.now() });
                        } else if (msg.topic === 'alert') {
                            console.log('[WS] Received alert:', msg);
                            setAlertData({ ...msg, timestamp: Date.now() });
                        }
                    } catch {
                        console.warn('[WS] invalid message');
                    }
                };

                ws.onerror = () => {
                    if (!alive) return;
                    console.error('[WS] Error');
                    setError('WebSocket error');
                };

                ws.onclose = () => {
                    if (!alive) return;
                    console.warn('[WS] Disconnected');
                    setIsConnected(false);
                };
            } catch (err: any) {
                console.error('[WS] Connect failed:', err);
                setError(err.message);
            }
        };

        connect();

        return () => {
            alive = false;
            websocketService.disconnect();
        };
    }, [mcuCode]);

    return {
        isConnected,
        error,
        healthData,
        alertData,
    };
};
