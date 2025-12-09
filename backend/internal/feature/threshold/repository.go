package threshold

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(threshold *HealthThreshold) error
	FindByUserID(userID uuid.UUID) (*HealthThreshold, error)
	Update(threshold *HealthThreshold) error
	GetOrCreate(userID uuid.UUID) (*HealthThreshold, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(threshold *HealthThreshold) error {
	return r.db.Create(threshold).Error
}

func (r *repository) FindByUserID(userID uuid.UUID) (*HealthThreshold, error) {
	var threshold HealthThreshold
	err := r.db.Where("user_id = ?", userID).First(&threshold).Error
	if err != nil {
		return nil, err
	}
	return &threshold, nil
}

func (r *repository) Update(threshold *HealthThreshold) error {
	return r.db.Save(threshold).Error
}

func (r *repository) GetOrCreate(userID uuid.UUID) (*HealthThreshold, error) {
	threshold, err := r.FindByUserID(userID)
	if err == nil {
		return threshold, nil
	}

	if err == gorm.ErrRecordNotFound {
		threshold = &HealthThreshold{
			UserID:         userID,
			HeartRateMin:   60,
			HeartRateMax:   100,
			SpO2Min:        95,
			BodyTempMin:    36.1,
			BodyTempMax:    37.2,
			BPSystolicMin:  90,
			BPSystolicMax:  140,
			BPDiastolicMin: 60,
			BPDiastolicMax: 90,
		}
		if err := r.Create(threshold); err != nil {
			return nil, err
		}
		return threshold, nil
	}

	return nil, err
}
