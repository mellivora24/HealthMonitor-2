package mqtt

import (
	"backend/internal/feature/alert"
	"backend/internal/feature/device"
	"backend/internal/feature/health_data"
	"backend/internal/feature/threshold"
	"backend/internal/realtime/shared"
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
}

func NewHandler(
	mqttService shared.MQTTService,
	wsService shared.WebSocketService,
	healthDataService health_data.Service,
	deviceService device.Service,
	alertService alert.Service,
	thresholdService threshold.Service,
) *Handler {
	return &Handler{
		mqttService:       mqttService,
		wsService:         wsService,
		healthDataService: healthDataService,
		deviceService:     deviceService,
		alertService:      alertService,
		thresholdService:  thresholdService,
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
	log.Printf("[MQTT Handler] Received message from: %s", msg.Topic())

	var healthPayload health_data.MQTTHealthPayload
	if err := json.Unmarshal(msg.Payload(), &healthPayload); err != nil {
		log.Printf("[MQTT Handler] Error unmarshaling JSON payload: %v", err)
		log.Printf("[MQTT Handler] RAW PAYLOAD: %s", string(msg.Payload()))
		return
	}

	if healthPayload.DeviceCode == "" {
		log.Printf("[MQTT Handler] Missing device_code in payload")
		log.Printf("[MQTT Handler] RAW PAYLOAD: %s", string(msg.Payload()))
		return
	}

	deviceInfo, err := h.deviceService.GetDeviceByCode(healthPayload.DeviceCode)
	if err != nil {
		log.Printf("[MQTT Handler] Device not found for code '%s': %v", healthPayload.DeviceCode, err)
		return
	}

	if !deviceInfo.IsActive {
		log.Printf("[MQTT Handler] Device '%s' is inactive", healthPayload.DeviceCode)
		return
	}

	if deviceInfo.UserID == nil {
		log.Printf("[MQTT Handler] Device '%s' is not assigned to any user", healthPayload.DeviceCode)
		return
	}

	healthRecord := &health_data.HealthData{
		UserID:                 *deviceInfo.UserID,
		DeviceID:               deviceInfo.ID,
		HeartRate:              healthPayload.HeartRate,
		SpO2:                   healthPayload.SpO2,
		BodyTemperature:        healthPayload.BodyTemperature,
		BloodPressureSystolic:  healthPayload.BPSystolic,
		BloodPressureDiastolic: healthPayload.BPDiastolic,
		AccelX:                 healthPayload.AccelX,
		AccelY:                 healthPayload.AccelY,
		AccelZ:                 healthPayload.AccelZ,
		CreatedAt:              time.Now(),
	}

	if err := h.healthDataService.CreateHealthData(healthRecord); err != nil {
		log.Printf("[MQTT Handler] Error saving health data: %v", err)
	} else {
		log.Printf("[MQTT Handler] Saved health data - Device: %s", healthPayload.DeviceCode)
	}

	if h.healthDataService.DetectFall(healthPayload.AccelX, healthPayload.AccelY, healthPayload.AccelZ) {
		h.createAlert(*deviceInfo.UserID, alert.AlertTypeFallDetection, "Fall detected! Immediate attention may be required.")
	}

	h.checkHealthThresholds(*deviceInfo.UserID, &healthPayload)

	wsMsg := shared.RealtimeModel{
		Topic:   "health_data",
		Payload: healthPayload,
	}

	if err := h.wsService.BroadcastToMCU(healthPayload.DeviceCode, wsMsg); err != nil {
		log.Printf("[MQTT Handler] Error broadcasting: %v", err)
	}
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

	log.Printf("[MQTT Handler]  Alert created: [%s] %s", alertType, message)

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
}

func getFloatValue(val *float64) float64 {
	if val == nil {
		return 0.0
	}
	return *val
}
