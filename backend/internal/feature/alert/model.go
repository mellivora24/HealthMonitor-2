package alert

import (
	"time"

	"github.com/google/uuid"
)

type Alert struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index:idx_alerts_user_id" json:"user_id"`
	AlertType string    `gorm:"type:varchar(50);not null" json:"alert_type"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	IsRead    bool      `gorm:"default:false;index:idx_alerts_is_read" json:"is_read"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP;index:idx_alerts_created_at,sort:desc" json:"created_at"`
}

func (Alert) TableName() string {
	return "alerts"
}

const (
	AlertTypeHeartRate     = "heart_rate"
	AlertTypeSpO2          = "spo2"
	AlertTypeTemperature   = "temperature"
	AlertTypeBloodPressure = "blood_pressure"
	AlertTypeFallDetection = "fall_detection"
	AlertTypeDeviceOffline = "device_offline"
)

type CreateAlertRequest struct {
	AlertType string `json:"alert_type" validate:"required"`
	Message   string `json:"message" validate:"required"`
}

type GetAlertsRequest struct {
	IsRead    *bool     `json:"is_read" form:"is_read"`
	AlertType string    `json:"alert_type" form:"alert_type"`
	StartDate time.Time `json:"start_date" form:"start_date"`
	EndDate   time.Time `json:"end_date" form:"end_date"`
	Page      int       `json:"page" form:"page" validate:"omitempty,gte=1"`
	PageSize  int       `json:"page_size" form:"page_size" validate:"omitempty,gte=1,lte=100"`
}

type MarkReadRequest struct {
	AlertIDs []uuid.UUID `json:"alert_ids" validate:"required,min=1"`
}

type AlertStats struct {
	TotalAlerts  int64 `json:"total_alerts"`
	UnreadAlerts int64 `json:"unread_alerts"`
}

type PaginatedAlertsResponse struct {
	Data       []Alert `json:"data"`
	TotalCount int64   `json:"total_count"`
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
}
