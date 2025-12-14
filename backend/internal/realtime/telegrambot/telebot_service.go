package telegram

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Service quản lý việc gửi tin nhắn qua Telegram
type Service struct {
	BotToken string
	ChatID   string
	Client   *http.Client
	Enabled  bool
}

// Message cấu trúc tin nhắn gửi đến Telegram API
type Message struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode,omitempty"`
}

// Response cấu trúc response từ Telegram API
type Response struct {
	Ok          bool   `json:"ok"`
	Description string `json:"description,omitempty"`
}

// Config cấu hình cho Telegram service
type Config struct {
	BotToken string
	ChatID   string
	Enabled  bool
}

// NewService khởi tạo service mới
func NewService(cfg Config) *Service {
	return &Service{
		BotToken: cfg.BotToken,
		ChatID:   cfg.ChatID,
		Enabled:  cfg.Enabled,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendMessage gửi tin nhắn thông thường
func (s *Service) SendMessage(message string) error {
	if !s.Enabled {
		return nil
	}
	return s.sendTelegramMessage(message, "")
}

// SendMarkdownMessage gửi tin nhắn với format Markdown
func (s *Service) SendMarkdownMessage(message string) error {
	if !s.Enabled {
		return nil
	}
	return s.sendTelegramMessage(message, "Markdown")
}

// SendAlert gửi cảnh báo với format đặc biệt
func (s *Service) SendAlert(title, message, level string) error {
	if !s.Enabled {
		return nil
	}
	emoji := s.getAlertEmoji(level)
	alertMessage := fmt.Sprintf("%s *%s*\n\n%s\n\n⏰ %s",
		emoji,
		title,
		message,
		time.Now().Format("15:04:05 02/01/2006"),
	)
	return s.sendTelegramMessage(alertMessage, "Markdown")
}

// SendHealthAlert gửi cảnh báo sức khỏe
func (s *Service) SendHealthAlert(userName, alertType, message string) error {
	if !s.Enabled {
		return nil
	}

	alertMessage := fmt.Sprintf(
		"🚨 *HEALTH ALERT*\n\n"+
			"👤 User: %s\n"+
			"🏥 Type: %s\n"+
			"📊 Details: %s\n\n"+
			"⏰ %s",
		userName,
		alertType,
		message,
		time.Now().Format("15:04:05 02/01/2006"),
	)

	return s.sendTelegramMessage(alertMessage, "Markdown")
}

// SendFallAlert gửi cảnh báo té ngã
func (s *Service) SendFallAlert(userName, message string) error {
	if !s.Enabled {
		return nil
	}

	alertMessage := fmt.Sprintf(
		"🆘 *FALL DETECTED*\n\n"+
			"👤 User: %s\n"+
			"⚠️ %s\n\n"+
			"⏰ %s\n"+
			"📍 Immediate attention required!",
		userName,
		message,
		time.Now().Format("15:04:05 02/01/2006"),
	)

	return s.sendTelegramMessage(alertMessage, "Markdown")
}

// sendTelegramMessage hàm nội bộ để gửi tin nhắn
func (s *Service) sendTelegramMessage(message, parseMode string) error {
	if s.BotToken == "" || s.ChatID == "" {
		return fmt.Errorf("telegram bot token or chat ID is not configured")
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.BotToken)

	telegramMsg := Message{
		ChatID:    s.ChatID,
		Text:      message,
		ParseMode: parseMode,
	}

	jsonData, err := json.Marshal(telegramMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}
	defer resp.Body.Close()

	var telegramResp Response
	if err := json.NewDecoder(resp.Body).Decode(&telegramResp); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	if !telegramResp.Ok {
		return fmt.Errorf("telegram API error: %s", telegramResp.Description)
	}

	return nil
}

// getAlertEmoji trả về emoji tương ứng với level cảnh báo
func (s *Service) getAlertEmoji(level string) string {
	switch level {
	case "error", "critical":
		return "🚨"
	case "warning":
		return "⚠️"
	case "info":
		return "ℹ️"
	case "success":
		return "✅"
	default:
		return "📢"
	}
}
