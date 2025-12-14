package health_data

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(data *HealthData) error
	GetLatestByUserID(userID uuid.UUID) (*HealthData, error)
	GetLatestByDeviceID(deviceID uuid.UUID) (*HealthData, error)
	GetPaginated(userID uuid.UUID, req GetHealthDataRequest) ([]HealthData, int64, error)
	GetStats(userID uuid.UUID, deviceID *uuid.UUID, startDate, endDate time.Time) (*HealthDataStats, error)
	GetChartData(userID uuid.UUID, req GetChartDataRequest) ([]ChartDataPoint, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(data *HealthData) error {
	return r.db.Create(data).Error
}

func (r *repository) GetLatestByUserID(userID uuid.UUID) (*HealthData, error) {
	var data HealthData
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").First(&data).Error
	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (r *repository) GetLatestByDeviceID(deviceID uuid.UUID) (*HealthData, error) {
	var data HealthData
	err := r.db.Where("device_id = ?", deviceID).Order("created_at DESC").First(&data).Error
	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (r *repository) GetPaginated(userID uuid.UUID, req GetHealthDataRequest) ([]HealthData, int64, error) {
	var data []HealthData
	var total int64

	query := r.db.Model(&HealthData{}).Where("user_id = ?", userID)

	if req.DeviceID != "" {
		deviceID, err := uuid.Parse(req.DeviceID)
		if err == nil {
			query = query.Where("device_id = ?", deviceID)
		}
	}

	if !req.StartDate.IsZero() {
		query = query.Where("created_at >= ?", req.StartDate)
	}

	if !req.EndDate.IsZero() {
		query = query.Where("created_at <= ?", req.EndDate)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 1000 {
		pageSize = 1000
	}

	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&data).Error

	return data, total, err
}

func (r *repository) GetStats(userID uuid.UUID, deviceID *uuid.UUID, startDate, endDate time.Time) (*HealthDataStats, error) {
	query := r.db.Model(&HealthData{}).Where("user_id = ?", userID)

	if deviceID != nil {
		query = query.Where("device_id = ?", *deviceID)
	}

	if !startDate.IsZero() {
		query = query.Where("created_at >= ?", startDate)
	}

	if !endDate.IsZero() {
		query = query.Where("created_at <= ?", endDate)
	}

	var stats HealthDataStats
	err := query.Select(`
		AVG(heart_rate) as avg_heart_rate,
		MIN(heart_rate) as min_heart_rate,
		MAX(heart_rate) as max_heart_rate,
		AVG(spo2) as avg_spo2,
		AVG(body_temperature) as avg_body_temperature,
		AVG(blood_pressure_systolic) as avg_blood_pressure_systolic,
		AVG(blood_pressure_diastolic) as avg_blood_pressure_diastolic
	`).Scan(&stats).Error

	return &stats, err
}

func (r *repository) GetChartData(userID uuid.UUID, req GetChartDataRequest) ([]ChartDataPoint, error) {
	var data []ChartDataPoint

	query := r.db.Model(&HealthData{}).Where("user_id = ?", userID)

	if req.DeviceID != "" {
		deviceID, err := uuid.Parse(req.DeviceID)
		if err == nil {
			query = query.Where("device_id = ?", deviceID)
		}
	}

	query = query.Where("created_at >= ? AND created_at <= ?", req.StartDate, req.EndDate)

	var groupBy string
	switch req.Interval {
	case "minute":
		groupBy = "DATE_TRUNC('minute', created_at)"
	case "hour":
		groupBy = "DATE_TRUNC('hour', created_at)"
	case "day":
		groupBy = "DATE_TRUNC('day', created_at)"
	default:
		groupBy = "DATE_TRUNC('hour', created_at)"
	}

	err := query.Select(`
		` + groupBy + ` as timestamp,
		AVG(heart_rate) as heart_rate,
		AVG(spo2) as spo2,
		AVG(body_temperature) as body_temperature,
		AVG(blood_pressure_systolic) as blood_pressure_systolic,
		AVG(blood_pressure_diastolic) as blood_pressure_diastolic
	`).Group(groupBy).Order("timestamp ASC").Scan(&data).Error

	return data, err
}
