package websocket

import (
	"backend/internal/realtime/shared"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Handler struct {
	service shared.WebSocketService
}

func NewHandler(service shared.WebSocketService) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) HandleConnection(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	mcuCode := c.Query("mcu_code")
	if mcuCode == "" {
		c.JSON(400, gin.H{"error": "mcu_code is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WS Handler] Upgrade error: %v", err)
		return
	}

	uid := userID.(uuid.UUID).String()
	client := h.service.AddClient(uid, mcuCode, conn)

	go h.service.HandleClientRead(client, h.onMessage)
	go h.service.HandleClientWrite(client)

	log.Printf("[WS Handler] New connection: User=%s, MCU=%s", uid, mcuCode)
}

func (h *Handler) onMessage(clientID string, msg shared.RealtimeModel) {
	log.Printf("[WS Handler] Message from %s: %+v", clientID, msg)
}
