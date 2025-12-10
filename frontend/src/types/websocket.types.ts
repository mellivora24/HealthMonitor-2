export interface WebSocketMessage<T = any> {
    topic: string;
    payload: T;
}
