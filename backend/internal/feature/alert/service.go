package alert

import (
	"errors"
	"fmt"
	"math"

	"github.com/google/uuid"
)

type Service interface {
	CreateAlert(userID uuid.UUID, alertType, message string) error
	GetAlerts(userID uuid.UUID, req GetAlertsRequest) (*PaginatedAlertsResponse, error)
	GetStats(userID uuid.UUID) (*AlertStats, error)
	MarkAsRead(userID uuid.UUID, req MarkReadRequest) error
	DeleteAlert(alertID uuid.UUID, userID uuid.UUID) error
	DeleteMultiple(alertIDs []uuid.UUID, userID uuid.UUID) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateAlert(userID uuid.UUID, alertType, message string) error {
	alert := &Alert{
		UserID:    userID,
		AlertType: alertType,
		Message:   message,
		IsRead:    false,
	}
	return s.repo.Create(alert)
}

func (s *service) GetAlerts(userID uuid.UUID, req GetAlertsRequest) (*PaginatedAlertsResponse, error) {
	alerts, total, err := s.repo.GetPaginated(userID, req)
	if err != nil {
		return nil, err
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 20
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &PaginatedAlertsResponse{
		Data:       alerts,
		TotalCount: total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *service) GetStats(userID uuid.UUID) (*AlertStats, error) {
	return s.repo.GetStats(userID)
}

func (s *service) MarkAsRead(userID uuid.UUID, req MarkReadRequest) error {
	if len(req.AlertIDs) == 0 {
		return errors.New("alert_ids cannot be empty")
	}
	return s.repo.MarkAsRead(req.AlertIDs, userID)
}

func (s *service) DeleteAlert(alertID uuid.UUID, userID uuid.UUID) error {
	return s.repo.Delete(alertID, userID)
}

func (s *service) DeleteMultiple(alertIDs []uuid.UUID, userID uuid.UUID) error {
	if len(alertIDs) == 0 {
		return errors.New("alert_ids cannot be empty")
	}
	return s.repo.DeleteMultiple(alertIDs, userID)
}

func GenerateAlertMessage(alertType string, value float64, min, max float64, severity string) string {
	switch alertType {
	case AlertTypeHeartRate:
		if value < min {
			return fmt.Sprintf("⚠️ Heart rate is too low: %.1f bpm (normal: %.1f-%.1f bpm). Severity: %s", value, min, max, severity)
		}
		return fmt.Sprintf("⚠️ Heart rate is too high: %.1f bpm (normal: %.1f-%.1f bpm). Severity: %s", value, min, max, severity)
	case AlertTypeSpO2:
		return fmt.Sprintf("⚠️ Blood oxygen level is low: %.1f%% (normal: ≥%.1f%%). Severity: %s", value, min, severity)
	case AlertTypeTemperature:
		if value < min {
			return fmt.Sprintf("⚠️ Body temperature is too low: %.1f°C (normal: %.1f-%.1f°C). Severity: %s", value, min, max, severity)
		}
		return fmt.Sprintf("⚠️ Body temperature is too high: %.1f°C (normal: %.1f-%.1f°C). Severity: %s", value, min, max, severity)
	case AlertTypeBloodPressure:
		return fmt.Sprintf("⚠️ Blood pressure is abnormal: %.1f mmHg (normal: %.1f-%.1f mmHg). Severity: %s", value, min, max, severity)
	case AlertTypeFallDetection:
		return "🚨 Fall detected! Immediate attention may be required."
	case AlertTypeDeviceOffline:
		return "📵 Device is offline. Please check the connection."
	default:
		return fmt.Sprintf("Alert: %s - Value: %.1f", alertType, value)
	}
}
