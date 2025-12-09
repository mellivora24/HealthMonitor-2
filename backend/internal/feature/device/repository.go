package device

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(device *Device) error
	FindByID(id uuid.UUID) (*Device, error)
	FindByCode(deviceCode string) (*Device, error)
	FindByUserID(userID uuid.UUID) ([]Device, error)
	Update(device *Device) error
	AssignToUser(deviceCode string, userID uuid.UUID) error
	UnassignDevice(deviceCode string) error
	Delete(id uuid.UUID) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(device *Device) error {
	return r.db.Create(device).Error
}

func (r *repository) FindByID(id uuid.UUID) (*Device, error) {
	var device Device
	err := r.db.First(&device, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &device, nil
}

func (r *repository) FindByCode(deviceCode string) (*Device, error) {
	var device Device
	err := r.db.Where("device_code = ?", deviceCode).First(&device).Error
	if err != nil {
		return nil, err
	}
	return &device, nil
}

func (r *repository) FindByUserID(userID uuid.UUID) ([]Device, error) {
	var devices []Device
	err := r.db.Where("user_id = ?", userID).Find(&devices).Error
	return devices, err
}

func (r *repository) Update(device *Device) error {
	return r.db.Save(device).Error
}

func (r *repository) AssignToUser(deviceCode string, userID uuid.UUID) error {
	return r.db.Model(&Device{}).Where("device_code = ?", deviceCode).
		Updates(map[string]interface{}{
			"user_id":   userID,
			"is_active": true,
		}).Error
}

func (r *repository) UnassignDevice(deviceCode string) error {
	return r.db.Model(&Device{}).Where("device_code = ?", deviceCode).
		Update("user_id", nil).Error
}

func (r *repository) Delete(id uuid.UUID) error {
	return r.db.Delete(&Device{}, "id = ?", id).Error
}
