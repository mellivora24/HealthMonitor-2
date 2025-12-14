package websocket

import (
	"backend/infra/network"
	realtimeShared "backend/internal/realtime/shared"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type wsService struct {
	hub     *network.WebSocketHub
	clients map[string]*realtimeShared.Client // key = clientID
	mcuMap  map[string][]string               // mcuCode -> []clientID
	mu      sync.RWMutex
}

func NewService(hub *network.WebSocketHub) realtimeShared.WebSocketService {
	return &wsService{
		hub:     hub,
		clients: make(map[string]*realtimeShared.Client),
		mcuMap:  make(map[string][]string),
	}
}

func (s *wsService) AddClient(uid, mcuCode string, conn *websocket.Conn) *realtimeShared.Client {
	clientID := fmt.Sprintf("%s_%s_%d", uid, mcuCode, time.Now().UnixNano())

	client := &realtimeShared.Client{
		ID:      clientID,
		UID:     uid,
		MCUCode: mcuCode,
		Conn:    conn,
		Send:    make(chan []byte, 256),
	}

	s.mu.Lock()
	s.clients[clientID] = client
	s.mcuMap[mcuCode] = append(s.mcuMap[mcuCode], clientID)
	s.mu.Unlock()

	log.Printf("[WS] Client added: %s (uid=%s mcu=%s)", clientID, uid, mcuCode)
	return client
}

func (s *wsService) RemoveClient(clientID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	client, ok := s.clients[clientID]
	if !ok {
		return
	}

	if ids, ok := s.mcuMap[client.MCUCode]; ok {
		for i, id := range ids {
			if id == clientID {
				s.mcuMap[client.MCUCode] = append(ids[:i], ids[i+1:]...)
				break
			}
		}
		if len(s.mcuMap[client.MCUCode]) == 0 {
			delete(s.mcuMap, client.MCUCode)
		}
	}

	close(client.Send)
	delete(s.clients, clientID)

	log.Printf("[WS] Client removed: %s", clientID)
}

func (s *wsService) BroadcastToMCU(mcuCode string, message realtimeShared.RealtimeModel) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	s.mu.RLock()
	ids := append([]string(nil), s.mcuMap[mcuCode]...)
	s.mu.RUnlock()

	if len(ids) == 0 {
		return nil
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, id := range ids {
		if client, ok := s.clients[id]; ok {
			select {
			case client.Send <- data:
			default:
				log.Printf("[WS] Client %s buffer full, skip", id)
			}
		}
	}

	return nil
}

func (s *wsService) SendToClient(uid string, message realtimeShared.RealtimeModel) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	sent := false
	for _, client := range s.clients {
		if client.UID == uid {
			select {
			case client.Send <- data:
				sent = true
			default:
				log.Printf("[WS] Client %s buffer full", client.ID)
			}
		}
	}

	if !sent {
		return fmt.Errorf("no active client for uid=%s", uid)
	}

	return nil
}

func (s *wsService) HandleClientRead(
	client *realtimeShared.Client,
	onMessage func(clientID string, msg realtimeShared.RealtimeModel),
) {
	defer func() {
		s.RemoveClient(client.ID)
		client.Conn.Close()
	}()

	client.Conn.SetReadLimit(512 * 1024)
	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		var wsMsg realtimeShared.RealtimeModel
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			log.Printf("[WS] Unmarshal error client=%s err=%v", client.ID, err)
			continue
		}

		if onMessage != nil {
			onMessage(client.ID, wsMsg)
		}
	}
}

func (s *wsService) HandleClientWrite(client *realtimeShared.Client) {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case msg, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			w.Write(msg)

			n := len(client.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-client.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
