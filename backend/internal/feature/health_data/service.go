package health_data

import (
	"math"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CreateHealthData(data *HealthData) error
	GetLatestData(userID uuid.UUID) (*LatestHealthData, error)
	GetPaginatedData(userID uuid.UUID, req GetHealthDataRequest) (*PaginatedHealthDataResponse, error)
	GetStats(userID uuid.UUID, deviceID *uuid.UUID, startDate, endDate time.Time) (*HealthDataStats, error)
	GetChartData(userID uuid.UUID, req GetChartDataRequest) ([]ChartDataPoint, error)
	DetectFall(accelX, accelY, accelZ *float64) bool
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateHealthData(data *HealthData) error {
	return s.repo.Create(data)
}

func (s *service) GetLatestData(userID uuid.UUID) (*LatestHealthData, error) {
	data, err := s.repo.GetLatestByUserID(userID)
	if err != nil {
		return nil, err
	}

	return &LatestHealthData{
		ID:                     data.ID,
		UserID:                 data.UserID,
		DeviceID:               data.DeviceID,
		HeartRate:              data.HeartRate,
		SpO2:                   data.SpO2,
		BodyTemperature:        data.BodyTemperature,
		BloodPressureSystolic:  data.BPSystolic,
		BloodPressureDiastolic: data.BPDiastolic,
		AccelX:                 data.AccelX,
		AccelY:                 data.AccelY,
		AccelZ:                 data.AccelZ,
		CreatedAt:              data.CreatedAt,
	}, nil
}

func (s *service) GetPaginatedData(userID uuid.UUID, req GetHealthDataRequest) (*PaginatedHealthDataResponse, error) {
	data, total, err := s.repo.GetPaginated(userID, req)
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

	return &PaginatedHealthDataResponse{
		Data:       data,
		TotalCount: total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *service) GetStats(userID uuid.UUID, deviceID *uuid.UUID, startDate, endDate time.Time) (*HealthDataStats, error) {
	return s.repo.GetStats(userID, deviceID, startDate, endDate)
}

func (s *service) GetChartData(userID uuid.UUID, req GetChartDataRequest) ([]ChartDataPoint, error) {
	return s.repo.GetChartData(userID, req)
}

func (s *service) DetectFall(accelX, accelY, accelZ *float64) bool {
	if accelX == nil || accelY == nil || accelZ == nil {
		return false
	}

	magnitude := math.Sqrt(*accelX**accelX + *accelY**accelY + *accelZ**accelZ)

	fallThreshold := 2.5
	return magnitude > fallThreshold
}
