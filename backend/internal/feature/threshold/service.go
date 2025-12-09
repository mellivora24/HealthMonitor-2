package threshold

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	GetThreshold(userID uuid.UUID) (*ThresholdResponse, error)
	UpdateThreshold(userID uuid.UUID, req UpdateThresholdRequest) (*ThresholdResponse, error)
	CheckViolations(userID uuid.UUID, heartRate, spo2, bodyTemp, bpSystolic, bpDiastolic *float64) ([]ThresholdViolation, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetThreshold(userID uuid.UUID) (*ThresholdResponse, error) {
	threshold, err := s.repo.GetOrCreate(userID)
	if err != nil {
		return nil, err
	}

	return s.toResponse(threshold), nil
}

func (s *service) UpdateThreshold(userID uuid.UUID, req UpdateThresholdRequest) (*ThresholdResponse, error) {
	threshold, err := s.repo.GetOrCreate(userID)
	if err != nil {
		return nil, err
	}

	if req.HeartRateMin != nil {
		threshold.HeartRateMin = *req.HeartRateMin
	}
	if req.HeartRateMax != nil {
		threshold.HeartRateMax = *req.HeartRateMax
	}
	if req.SpO2Min != nil {
		threshold.SpO2Min = *req.SpO2Min
	}
	if req.BodyTempMin != nil {
		threshold.BodyTempMin = *req.BodyTempMin
	}
	if req.BodyTempMax != nil {
		threshold.BodyTempMax = *req.BodyTempMax
	}
	if req.BPSystolicMin != nil {
		threshold.BPSystolicMin = *req.BPSystolicMin
	}
	if req.BPSystolicMax != nil {
		threshold.BPSystolicMax = *req.BPSystolicMax
	}
	if req.BPDiastolicMin != nil {
		threshold.BPDiastolicMin = *req.BPDiastolicMin
	}
	if req.BPDiastolicMax != nil {
		threshold.BPDiastolicMax = *req.BPDiastolicMax
	}

	if err := s.validateThresholds(threshold); err != nil {
		return nil, err
	}

	threshold.UpdatedAt = time.Now()
	if err := s.repo.Update(threshold); err != nil {
		return nil, err
	}

	return s.toResponse(threshold), nil
}

func (s *service) CheckViolations(userID uuid.UUID, heartRate, spo2, bodyTemp, bpSystolic, bpDiastolic *float64) ([]ThresholdViolation, error) {
	threshold, err := s.repo.GetOrCreate(userID)
	if err != nil {
		return nil, err
	}

	var violations []ThresholdViolation

	if heartRate != nil {
		if *heartRate < threshold.HeartRateMin {
			violations = append(violations, ThresholdViolation{
				Parameter: "heart_rate",
				Value:     *heartRate,
				Min:       threshold.HeartRateMin,
				Max:       threshold.HeartRateMax,
				Severity:  s.calculateSeverity(*heartRate, threshold.HeartRateMin, threshold.HeartRateMax),
			})
		} else if *heartRate > threshold.HeartRateMax {
			violations = append(violations, ThresholdViolation{
				Parameter: "heart_rate",
				Value:     *heartRate,
				Min:       threshold.HeartRateMin,
				Max:       threshold.HeartRateMax,
				Severity:  s.calculateSeverity(*heartRate, threshold.HeartRateMin, threshold.HeartRateMax),
			})
		}
	}

	if spo2 != nil && *spo2 < threshold.SpO2Min {
		violations = append(violations, ThresholdViolation{
			Parameter: "spo2",
			Value:     *spo2,
			Min:       threshold.SpO2Min,
			Severity:  s.calculateSpO2Severity(*spo2, threshold.SpO2Min),
		})
	}

	if bodyTemp != nil {
		if *bodyTemp < threshold.BodyTempMin {
			violations = append(violations, ThresholdViolation{
				Parameter: "body_temperature",
				Value:     *bodyTemp,
				Min:       threshold.BodyTempMin,
				Max:       threshold.BodyTempMax,
				Severity:  "warning",
			})
		} else if *bodyTemp > threshold.BodyTempMax {
			violations = append(violations, ThresholdViolation{
				Parameter: "body_temperature",
				Value:     *bodyTemp,
				Min:       threshold.BodyTempMin,
				Max:       threshold.BodyTempMax,
				Severity:  s.calculateTempSeverity(*bodyTemp, threshold.BodyTempMax),
			})
		}
	}

	if bpSystolic != nil {
		if *bpSystolic < threshold.BPSystolicMin || *bpSystolic > threshold.BPSystolicMax {
			violations = append(violations, ThresholdViolation{
				Parameter: "blood_pressure_systolic",
				Value:     *bpSystolic,
				Min:       threshold.BPSystolicMin,
				Max:       threshold.BPSystolicMax,
				Severity:  s.calculateBPSeverity(*bpSystolic, threshold.BPSystolicMin, threshold.BPSystolicMax),
			})
		}
	}

	if bpDiastolic != nil {
		if *bpDiastolic < threshold.BPDiastolicMin || *bpDiastolic > threshold.BPDiastolicMax {
			violations = append(violations, ThresholdViolation{
				Parameter: "blood_pressure_diastolic",
				Value:     *bpDiastolic,
				Min:       threshold.BPDiastolicMin,
				Max:       threshold.BPDiastolicMax,
				Severity:  s.calculateBPSeverity(*bpDiastolic, threshold.BPDiastolicMin, threshold.BPDiastolicMax),
			})
		}
	}

	return violations, nil
}

func (s *service) validateThresholds(t *HealthThreshold) error {
	if t.HeartRateMin >= t.HeartRateMax {
		return errors.New("heart rate min must be less than max")
	}
	if t.BodyTempMin >= t.BodyTempMax {
		return errors.New("body temperature min must be less than max")
	}
	if t.BPSystolicMin >= t.BPSystolicMax {
		return errors.New("systolic BP min must be less than max")
	}
	if t.BPDiastolicMin >= t.BPDiastolicMax {
		return errors.New("diastolic BP min must be less than max")
	}
	return nil
}

func (s *service) calculateSeverity(value, min, max float64) string {
	if value < min {
		diff := min - value
		if diff >= 20 {
			return "critical"
		} else if diff >= 10 {
			return "warning"
		}
	} else if value > max {
		diff := value - max
		if diff >= 20 {
			return "critical"
		} else if diff >= 10 {
			return "warning"
		}
	}
	return "info"
}

func (s *service) calculateSpO2Severity(value, min float64) string {
	diff := min - value
	if diff >= 5 {
		return "critical"
	} else if diff >= 2 {
		return "warning"
	}
	return "info"
}

func (s *service) calculateTempSeverity(value, max float64) string {
	if value >= 39 {
		return "critical"
	} else if value >= 38 {
		return "warning"
	}
	return "info"
}

func (s *service) calculateBPSeverity(value, min, max float64) string {
	if value < min {
		diff := min - value
		if diff >= 20 {
			return "critical"
		}
		return "warning"
	} else if value > max {
		diff := value - max
		if diff >= 20 {
			return "critical"
		}
		return "warning"
	}
	return "info"
}

func (s *service) toResponse(threshold *HealthThreshold) *ThresholdResponse {
	return &ThresholdResponse{
		ID:             threshold.ID,
		UserID:         threshold.UserID,
		HeartRateMin:   threshold.HeartRateMin,
		HeartRateMax:   threshold.HeartRateMax,
		SpO2Min:        threshold.SpO2Min,
		BodyTempMin:    threshold.BodyTempMin,
		BodyTempMax:    threshold.BodyTempMax,
		BPSystolicMin:  threshold.BPSystolicMin,
		BPSystolicMax:  threshold.BPSystolicMax,
		BPDiastolicMin: threshold.BPDiastolicMin,
		BPDiastolicMax: threshold.BPDiastolicMax,
		UpdatedAt:      threshold.UpdatedAt,
	}
}
