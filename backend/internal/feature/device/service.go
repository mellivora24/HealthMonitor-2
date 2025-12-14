package device

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	CreateDevice(req CreateDeviceRequest) (*DeviceResponse, error)
	GetDeviceByID(id uuid.UUID) (*DeviceResponse, error)
	GetDeviceByCode(deviceCode string) (*DeviceResponse, error)
	GetUserDevices(userID uuid.UUID) ([]DeviceResponse, error)
	UpdateDevice(id uuid.UUID, req UpdateDeviceRequest) (*DeviceResponse, error)
	AssignDevice(userID uuid.UUID, req AssignDeviceRequest) (*DeviceResponse, error)
	UnassignDevice(deviceCode string, userID uuid.UUID) error
	DeleteDevice(id uuid.UUID, userID uuid.UUID) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateDevice(req CreateDeviceRequest) (*DeviceResponse, error) {
	existingDevice, _ := s.repo.FindByCode(req.DeviceCode)
	if existingDevice != nil {
		return nil, errors.New("device code already exists")
	}

	device := &Device{
		DeviceCode: req.DeviceCode,
		DeviceName: req.DeviceName,
		IsActive:   true,
	}

	if err := s.repo.Create(device); err != nil {
		return nil, err
	}

	return s.toResponse(device), nil
}

func (s *service) GetDeviceByID(id uuid.UUID) (*DeviceResponse, error) {
	device, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return s.toResponse(device), nil
}

func (s *service) GetDeviceByCode(deviceCode string) (*DeviceResponse, error) {
	device, err := s.repo.FindByCode(deviceCode)
	if err != nil {
		return nil, err
	}
	return s.toResponse(device), nil
}

func (s *service) GetUserDevices(userID uuid.UUID) ([]DeviceResponse, error) {
	devices, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]DeviceResponse, len(devices))
	for i, device := range devices {
		responses[i] = *s.toResponse(&device)
	}
	return responses, nil
}

func (s *service) UpdateDevice(id uuid.UUID, req UpdateDeviceRequest) (*DeviceResponse, error) {
	device, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.DeviceName != "" {
		device.DeviceName = req.DeviceName
	}
	if req.IsActive != nil {
		device.IsActive = *req.IsActive
	}
	device.UpdatedAt = time.Now()

	if err := s.repo.Update(device); err != nil {
		return nil, err
	}

	return s.toResponse(device), nil
}

func (s *service) AssignDevice(userID uuid.UUID, req AssignDeviceRequest) (*DeviceResponse, error) {
	device, err := s.repo.FindByCode(req.DeviceCode)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			newDevice := &Device{
				UserID:     userID,
				DeviceCode: req.DeviceCode,
				DeviceName: req.DeviceCode,
				IsActive:   true,
			}

			if err := s.repo.Create(newDevice); err != nil {
				return nil, err
			}

			return s.toResponse(newDevice), nil
		}
		return nil, err
	}

	if err := s.repo.AssignToUser(req.DeviceCode, userID); err != nil {
		return nil, err
	}

	device, err = s.repo.FindByCode(req.DeviceCode)
	if err != nil {
		return nil, err
	}

	return s.toResponse(device), nil
}

func (s *service) UnassignDevice(deviceCode string, userID uuid.UUID) error {
	device, err := s.repo.FindByCode(deviceCode)
	if err != nil {
		return err
	}

	if device.UserID == uuid.Nil || device.UserID != userID {
		return errors.New("device is not assigned to this user")
	}

	return s.repo.UnassignDevice(deviceCode)
}

func (s *service) DeleteDevice(id uuid.UUID, userID uuid.UUID) error {
	device, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if device.UserID == uuid.Nil || device.UserID != userID {
		return errors.New("device is not assigned to this user")
	}

	return s.repo.Delete(id)
}

func (s *service) toResponse(device *Device) *DeviceResponse {
	return &DeviceResponse{
		ID:         device.ID,
		UserID:     &device.UserID,
		DeviceCode: device.DeviceCode,
		DeviceName: device.DeviceName,
		IsActive:   device.IsActive,
		IsAssigned: device.UserID != uuid.Nil,
		CreatedAt:  device.CreatedAt,
	}
}
