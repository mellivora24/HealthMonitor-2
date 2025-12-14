package health_data

import (
	"time"

	"github.com/google/uuid"
)

type HealthData struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID   uuid.UUID `gorm:"type:uuid;not null;index:idx_health_data_user_id" json:"user_id"`
	DeviceID uuid.UUID `gorm:"type:uuid;not null;index:idx_health_data_device_id" json:"device_id"`

	HeartRate       *float64 `gorm:"type:decimal(6,2);column:heart_rate" json:"heart_rate,omitempty"`
	SpO2            *float64 `gorm:"type:decimal(5,2);column:spo2" json:"spo2,omitempty"`
	BodyTemperature *float64 `gorm:"type:decimal(4,2);column:body_temperature" json:"body_temperature,omitempty"`

	BPSystolic  *float64 `gorm:"type:decimal(5,2);column:blood_pressure_systolic" json:"blood_pressure_systolic,omitempty"`
	BPDiastolic *float64 `gorm:"type:decimal(5,2);column:blood_pressure_diastolic" json:"blood_pressure_diastolic,omitempty"`

	AccelX *float64 `gorm:"type:decimal(6,3);column:accel_x" json:"accel_x,omitempty"`
	AccelY *float64 `gorm:"type:decimal(6,3);column:accel_y" json:"accel_y,omitempty"`
	AccelZ *float64 `gorm:"type:decimal(6,3);column:accel_z" json:"accel_z,omitempty"`

	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP;index:idx_health_data_created_at,sort:desc" json:"created_at"`
}

func (HealthData) TableName() string {
	return "health_data"
}

type LatestHealthData struct {
	ID                     uuid.UUID `json:"id"`
	UserID                 uuid.UUID `json:"user_id"`
	DeviceID               uuid.UUID `json:"device_id"`
	HeartRate              *float64  `json:"heart_rate,omitempty"`
	SpO2                   *float64  `json:"spo2,omitempty"`
	BodyTemperature        *float64  `json:"body_temperature,omitempty"`
	BloodPressureSystolic  *float64  `json:"blood_pressure_systolic,omitempty"`
	BloodPressureDiastolic *float64  `json:"blood_pressure_diastolic,omitempty"`
	AccelX                 *float64  `json:"accel_x,omitempty"`
	AccelY                 *float64  `json:"accel_y,omitempty"`
	AccelZ                 *float64  `json:"accel_z,omitempty"`
	CreatedAt              time.Time `json:"created_at"`
}

type MQTTHealthPayload struct {
	DeviceCode      string   `json:"device_code"`
	HeartRate       *float64 `json:"heart_rate,omitempty"`
	SpO2            *float64 `json:"spo2,omitempty"`
	BodyTemperature *float64 `json:"body_temperature,omitempty"`
	BPSystolic      *float64 `json:"bp_systolic,omitempty"`
	BPDiastolic     *float64 `json:"bp_diastolic,omitempty"`
	AccelX          *float64 `json:"accel_x,omitempty"`
	AccelY          *float64 `json:"accel_y,omitempty"`
	AccelZ          *float64 `json:"accel_z,omitempty"`
}

type GetHealthDataRequest struct {
	DeviceID  string    `json:"device_id" form:"device_id"`
	StartDate time.Time `json:"start_date" form:"start_date"`
	EndDate   time.Time `json:"end_date" form:"end_date"`
	Page      int       `json:"page" form:"page" validate:"omitempty,gte=1"`
	PageSize  int       `json:"page_size" form:"page_size" validate:"omitempty,gte=1,lte=1000"`
}

type PaginatedHealthDataResponse struct {
	Data       []HealthData `json:"data"`
	TotalCount int64        `json:"total_count"`
	Page       int          `json:"page"`
	PageSize   int          `json:"page_size"`
	TotalPages int          `json:"total_pages"`
}

type HealthDataStats struct {
	AvgHeartRate              *float64 `json:"avg_heart_rate,omitempty"`
	MinHeartRate              *float64 `json:"min_heart_rate,omitempty"`
	MaxHeartRate              *float64 `json:"max_heart_rate,omitempty"`
	AvgSpO2                   *float64 `json:"avg_spo2,omitempty"`
	AvgBodyTemperature        *float64 `json:"avg_body_temperature,omitempty"`
	AvgBloodPressureSystolic  *float64 `json:"avg_blood_pressure_systolic,omitempty"`
	AvgBloodPressureDiastolic *float64 `json:"avg_blood_pressure_diastolic,omitempty"`
}

type ChartDataPoint struct {
	Timestamp              time.Time `json:"timestamp"`
	HeartRate              *float64  `json:"heart_rate,omitempty"`
	SpO2                   *float64  `json:"spo2,omitempty"`
	BodyTemperature        *float64  `json:"body_temperature,omitempty"`
	BloodPressureSystolic  *float64  `json:"blood_pressure_systolic,omitempty"`
	BloodPressureDiastolic *float64  `json:"blood_pressure_diastolic,omitempty"`
}

type GetChartDataRequest struct {
	DeviceID  string    `json:"device_id" form:"device_id"`
	StartDate time.Time `json:"start_date" form:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" form:"end_date" validate:"required"`
	Interval  string    `json:"interval" form:"interval" validate:"omitempty,oneof=minute hour day"`
}
