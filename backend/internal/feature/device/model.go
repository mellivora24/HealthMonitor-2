package device

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index:idx_devices_user_id" json:"user_id"`
	DeviceCode string    `gorm:"type:varchar(100);unique;index:idx_devices_device_code" json:"device_code"`
	DeviceName string    `gorm:"type:varchar(255)" json:"device_name"`
	IsActive   bool      `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Device) TableName() string {
	return "devices"
}

type CreateDeviceRequest struct {
	DeviceCode string `json:"device_code" validate:"required"`
	DeviceName string `json:"device_name,omitempty"`
}

type UpdateDeviceRequest struct {
	DeviceName string `json:"device_name,omitempty"`
	IsActive   *bool  `json:"is_active,omitempty"`
}

type AssignDeviceRequest struct {
	DeviceCode string `json:"device_code" validate:"required"`
}

type DeviceResponse struct {
	ID         uuid.UUID  `json:"id"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	DeviceCode string     `json:"device_code"`
	DeviceName string     `json:"device_name"`
	IsActive   bool       `json:"is_active"`
	IsAssigned bool       `json:"is_assigned"`
	CreatedAt  time.Time  `json:"created_at"`
}
