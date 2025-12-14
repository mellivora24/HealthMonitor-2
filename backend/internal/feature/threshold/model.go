package threshold

import (
	"time"

	"github.com/google/uuid"
)

type HealthThreshold struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`

	HeartRateMin float64 `gorm:"type:decimal(6,2);column:heart_rate_min;default:60" json:"heart_rate_min"`
	HeartRateMax float64 `gorm:"type:decimal(6,2);column:heart_rate_max;default:100" json:"heart_rate_max"`

	SpO2Min float64 `gorm:"type:decimal(5,2);column:spo2_min;default:95" json:"spo2_min"`

	BodyTempMin float64 `gorm:"type:decimal(4,2);column:body_temp_min;default:36.1" json:"body_temp_min"`
	BodyTempMax float64 `gorm:"type:decimal(4,2);column:body_temp_max;default:37.2" json:"body_temp_max"`

	BPSystolicMin float64 `gorm:"type:decimal(5,2);column:bp_systolic_min;default:90" json:"bp_systolic_min"`
	BPSystolicMax float64 `gorm:"type:decimal(5,2);column:bp_systolic_max;default:140" json:"bp_systolic_max"`

	BPDiastolicMin float64 `gorm:"type:decimal(5,2);column:bp_diastolic_min;default:60" json:"bp_diastolic_min"`
	BPDiastolicMax float64 `gorm:"type:decimal(5,2);column:bp_diastolic_max;default:90" json:"bp_diastolic_max"`

	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (HealthThreshold) TableName() string {
	return "health_thresholds"
}

type UpdateThresholdRequest struct {
	HeartRateMin   *float64 `json:"heart_rate_min,omitempty" validate:"omitempty,gte=0"`
	HeartRateMax   *float64 `json:"heart_rate_max,omitempty" validate:"omitempty,gte=0"`
	SpO2Min        *float64 `json:"spo2_min,omitempty" validate:"omitempty,gte=0,lte=100"`
	BodyTempMin    *float64 `json:"body_temp_min,omitempty" validate:"omitempty,gte=0"`
	BodyTempMax    *float64 `json:"body_temp_max,omitempty" validate:"omitempty,gte=0"`
	BPSystolicMin  *float64 `json:"bp_systolic_min,omitempty" validate:"omitempty,gte=0"`
	BPSystolicMax  *float64 `json:"bp_systolic_max,omitempty" validate:"omitempty,gte=0"`
	BPDiastolicMin *float64 `json:"bp_diastolic_min,omitempty" validate:"omitempty,gte=0"`
	BPDiastolicMax *float64 `json:"bp_diastolic_max,omitempty" validate:"omitempty,gte=0"`
}

type ThresholdResponse struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"user_id"`
	HeartRateMin   float64   `json:"heart_rate_min"`
	HeartRateMax   float64   `json:"heart_rate_max"`
	SpO2Min        float64   `json:"spo2_min"`
	BodyTempMin    float64   `json:"body_temp_min"`
	BodyTempMax    float64   `json:"body_temp_max"`
	BPSystolicMin  float64   `json:"bp_systolic_min"`
	BPSystolicMax  float64   `json:"bp_systolic_max"`
	BPDiastolicMin float64   `json:"bp_diastolic_min"`
	BPDiastolicMax float64   `json:"bp_diastolic_max"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ThresholdViolation struct {
	Parameter string  `json:"parameter"`
	Value     float64 `json:"value"`
	Min       float64 `json:"min,omitempty"`
	Max       float64 `json:"max,omitempty"`
	Severity  string  `json:"severity"`
}
