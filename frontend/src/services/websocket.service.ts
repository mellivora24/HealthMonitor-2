import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';

class WebSocketService {
    private ws: WebSocket | null = null;

    async connect(mcuCode: string): Promise<WebSocket> {
        if (this.ws) {
            this.disconnect();
        }

        const token = await storage.get<string>(STORAGE_KEYS.TOKEN);
        if (!token) {
            throw new Error('No auth token');
        }

        const url =
            `${API_CONFIG.WS_URL}?mcu_code=${encodeURIComponent(mcuCode)}`;

        console.log('[WS Service] connect:', url);

        this.ws = new WebSocket(url, [], {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return this.ws;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const websocketService = new WebSocketService();
