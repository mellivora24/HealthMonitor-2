import { WS_BASE_URL } from '../utils/constants';
import { WebSocketMessage } from '../types';

type MessageHandler = (data: WebSocketMessage) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = () => void;

export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectInterval: number = 5000;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private messageHandlers: Set<MessageHandler> = new Set();
    private errorHandlers: Set<ErrorHandler> = new Set();
    private closeHandlers: Set<CloseHandler> = new Set();
    private isIntentionallyClosed: boolean = false;

    connect(token: string, deviceCode?: string): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.isIntentionallyClosed = false;
        let url = `${WS_BASE_URL}/ws?token=${token}`;
        if (deviceCode) {
            url += `&device_code=${deviceCode}`;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                if (message.topic && message.payload) {
                    this.messageHandlers.forEach(handler => handler(message));
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.errorHandlers.forEach(handler => handler(error));
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            this.closeHandlers.forEach(handler => handler());

            if (!this.isIntentionallyClosed) {
                this.scheduleReconnect(token, deviceCode);
            }
        };
    }

    private scheduleReconnect(token: string, deviceCode?: string): void {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            this.connect(token, deviceCode);
        }, this.reconnectInterval);
    }

    disconnect(): void {
        this.isIntentionallyClosed = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    onError(handler: ErrorHandler): () => void {
        this.errorHandlers.add(handler);
        return () => this.errorHandlers.delete(handler);
    }

    onClose(handler: CloseHandler): () => void {
        this.closeHandlers.add(handler);
        return () => this.closeHandlers.delete(handler);
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    send(data: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }
}

export const wsService = new WebSocketService();
