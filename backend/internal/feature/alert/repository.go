package alert

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(alert *Alert) error
	GetPaginated(userID uuid.UUID, req GetAlertsRequest) ([]Alert, int64, error)
	GetStats(userID uuid.UUID) (*AlertStats, error)
	MarkAsRead(alertIDs []uuid.UUID, userID uuid.UUID) error
	Delete(alertID uuid.UUID, userID uuid.UUID) error
	DeleteMultiple(alertIDs []uuid.UUID, userID uuid.UUID) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(alert *Alert) error {
	return r.db.Create(alert).Error
}

func (r *repository) GetPaginated(userID uuid.UUID, req GetAlertsRequest) ([]Alert, int64, error) {
	var alerts []Alert
	var total int64

	query := r.db.Model(&Alert{}).Where("user_id = ?", userID)

	if req.IsRead != nil {
		query = query.Where("is_read = ?", *req.IsRead)
	}

	if req.AlertType != "" {
		query = query.Where("alert_type = ?", req.AlertType)
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
	if pageSize > 100 {
		pageSize = 100
	}

	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&alerts).Error

	return alerts, total, err
}

func (r *repository) GetStats(userID uuid.UUID) (*AlertStats, error) {
	var stats AlertStats

	if err := r.db.Model(&Alert{}).Where("user_id = ?", userID).Count(&stats.TotalAlerts).Error; err != nil {
		return nil, err
	}

	if err := r.db.Model(&Alert{}).Where("user_id = ? AND is_read = ?", userID, false).
		Count(&stats.UnreadAlerts).Error; err != nil {
		return nil, err
	}

	return &stats, nil
}

func (r *repository) MarkAsRead(alertIDs []uuid.UUID, userID uuid.UUID) error {
	return r.db.Model(&Alert{}).
		Where("id IN ? AND user_id = ?", alertIDs, userID).
		Update("is_read", true).Error
}

func (r *repository) Delete(alertID uuid.UUID, userID uuid.UUID) error {
	return r.db.Where("id = ? AND user_id = ?", alertID, userID).Delete(&Alert{}).Error
}

func (r *repository) DeleteMultiple(alertIDs []uuid.UUID, userID uuid.UUID) error {
	return r.db.Where("id IN ? AND user_id = ?", alertIDs, userID).Delete(&Alert{}).Error
}
