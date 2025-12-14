package mqtt

import (
	"backend/internal/feature/alert"
	"backend/internal/feature/device"
	"backend/internal/feature/health_data"
	"backend/internal/feature/threshold"
	"backend/internal/feature/user"
	"backend/internal/realtime/shared"
	telegram "backend/internal/realtime/telegrambot"
	"encoding/json"
	"log"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/google/uuid"
)

type Handler struct {
	mqttService       shared.MQTTService
	wsService         shared.WebSocketService
	healthDataService health_data.Service
	deviceService     device.Service
	alertService      alert.Service
	thresholdService  threshold.Service
	telegramService   *telegram.Service
	userService       user.Service
}

func NewHandler(
	mqttService shared.MQTTService,
	wsService shared.WebSocketService,
	healthDataService health_data.Service,
	deviceService device.Service,
	alertService alert.Service,
	thresholdService threshold.Service,
	telegramService *telegram.Service,
	userService user.Service,
) *Handler {
	return &Handler{
		mqttService:       mqttService,
		wsService:         wsService,
		healthDataService: healthDataService,
		deviceService:     deviceService,
		alertService:      alertService,
		thresholdService:  thresholdService,
		telegramService:   telegramService,
		userService:       userService,
	}
}

func (h *Handler) Init() error {
	if err := h.mqttService.Subscribe(shared.MQTT_DATA_TOPIC, h.onHealthData); err != nil {
		return err
	}

	log.Printf("[MQTT Handler] ✓ Initialized and subscribed to: %s", shared.MQTT_DATA_TOPIC)
	return nil
}

func (h *Handler) onHealthData(client mqtt.Client, msg mqtt.Message) {
	log.Printf("[MQTT] Received: %s", msg.Payload())

	var payload health_data.MQTTHealthPayload
	if err := json.Unmarshal(msg.Payload(), &payload); err != nil {
		log.Printf("Invalid payload: %v", err)
		return
	}

	device, err := h.deviceService.GetDeviceByCode(payload.DeviceCode)
	if err != nil || !device.IsActive || device.UserID == nil {
		return
	}

	userID := *device.UserID

	record := &health_data.HealthData{
		UserID:          userID,
		DeviceID:        device.ID,
		HeartRate:       payload.HeartRate,
		SpO2:            payload.SpO2,
		BodyTemperature: payload.BodyTemperature,
		BPSystolic:      payload.BPSystolic,
		BPDiastolic:     payload.BPDiastolic,
		AccelX:          payload.AccelX,
		AccelY:          payload.AccelY,
		AccelZ:          payload.AccelZ,
		CreatedAt:       time.Now(),
	}

	_ = h.healthDataService.CreateHealthData(record)

	healthMsg := shared.RealtimeModel{
		Topic:   "health_data",
		Payload: payload,
	}
	h.wsService.SendToClient(userID.String(), healthMsg)

	if h.healthDataService.DetectFall(payload.AccelX, payload.AccelY, payload.AccelZ) {
		h.createAlert(userID, alert.AlertTypeFallDetection, "Fall detected! Immediate attention may be required.")
	}

	h.checkHealthThresholds(userID, &payload)
}

func (h *Handler) checkHealthThresholds(userID uuid.UUID, payload *health_data.MQTTHealthPayload) {
	violations, err := h.thresholdService.CheckViolations(
		userID,
		payload.HeartRate,
		payload.SpO2,
		payload.BodyTemperature,
		payload.BPSystolic,
		payload.BPDiastolic,
	)
	if err != nil {
		log.Printf("[MQTT Handler] Error checking thresholds: %v", err)
		return
	}

	for _, violation := range violations {
		var alertType string
		var message string

		switch violation.Parameter {
		case "heart_rate":
			alertType = alert.AlertTypeHeartRate
			message = alert.GenerateAlertMessage(
				alertType,
				violation.Value,
				violation.Min,
				violation.Max,
				violation.Severity,
			)
		case "spo2":
			alertType = alert.AlertTypeSpO2
			message = alert.GenerateAlertMessage(
				alertType,
				violation.Value,
				violation.Min,
				0,
				violation.Severity,
			)
		case "body_temperature":
			alertType = alert.AlertTypeTemperature
			message = alert.GenerateAlertMessage(
				alertType,
				violation.Value,
				violation.Min,
				violation.Max,
				violation.Severity,
			)
		case "blood_pressure_systolic", "blood_pressure_diastolic":
			alertType = alert.AlertTypeBloodPressure
			message = alert.GenerateAlertMessage(
				alertType,
				violation.Value,
				violation.Min,
				violation.Max,
				violation.Severity,
			)
		}

		if alertType != "" {
			h.createAlert(userID, alertType, message)
		}
	}
}

func (h *Handler) createAlert(userID uuid.UUID, alertType, message string) {
	if err := h.alertService.CreateAlert(userID, alertType, message); err != nil {
		log.Printf("[MQTT Handler] Error creating alert: %v", err)
		return
	}

	log.Printf("[MQTT Handler] 🚨 Alert created: [%s] %s", alertType, message)

	// Gửi alert qua WebSocket
	alertData := map[string]interface{}{
		"user_id":    userID,
		"alert_type": alertType,
		"message":    message,
		"is_read":    false,
		"created_at": time.Now(),
	}

	wsMsg := shared.RealtimeModel{
		Topic:   "alert",
		Payload: alertData,
	}

	if err := h.wsService.SendToClient(userID.String(), wsMsg); err != nil {
		log.Printf("[MQTT Handler] Error broadcasting alert: %v", err)
	}

	// Gửi alert qua Telegram
	h.sendTelegramNotification(userID, alertType, message)
}

func (h *Handler) sendTelegramNotification(userID uuid.UUID, alertType, message string) {
	if h.telegramService == nil {
		return
	}

	userName := "Unknown User"
	if user, err := h.userService.GetProfile(userID); err == nil && user != nil {
		userName = user.FullName
		if userName == "" {
			userName = user.Email
		}
	}

	var err error
	if alertType == alert.AlertTypeFallDetection {
		err = h.telegramService.SendFallAlert(userName, message)
	} else {
		err = h.telegramService.SendHealthAlert(userName, alertType, message)
	}

	if err != nil {
		log.Printf("[MQTT Handler] Error sending Telegram notification: %v", err)
	} else {
		log.Printf("[MQTT Handler] 📱 Telegram notification sent for user: %s", userName)
	}
}
