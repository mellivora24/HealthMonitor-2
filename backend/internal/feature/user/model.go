package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string     `gorm:"type:varchar(255);unique;not null" json:"email"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"-"`
	FullName     string     `gorm:"type:varchar(255);not null" json:"full_name"`
	DateOfBirth  *time.Time `gorm:"type:date" json:"date_of_birth,omitempty"`
	Gender       string     `gorm:"type:varchar(20)" json:"gender,omitempty"`
	Phone        string     `gorm:"type:varchar(20)" json:"phone,omitempty"`
	Height       *float64   `gorm:"type:decimal(5,2)" json:"height,omitempty"`
	Weight       *float64   `gorm:"type:decimal(5,2)" json:"weight,omitempty"`
	CreatedAt    time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	FullName string `json:"full_name" validate:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type UpdateProfileRequest struct {
	FullName    string     `json:"full_name,omitempty"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Gender      string     `json:"gender,omitempty"`
	Phone       string     `json:"phone,omitempty"`
	Height      *float64   `json:"height,omitempty"`
	Weight      *float64   `json:"weight,omitempty"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

type UserResponse struct {
	ID          uuid.UUID  `json:"id"`
	Email       string     `json:"email"`
	FullName    string     `json:"full_name"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Gender      string     `json:"gender,omitempty"`
	Phone       string     `json:"phone,omitempty"`
	Height      *float64   `json:"height,omitempty"`
	Weight      *float64   `json:"weight,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}
