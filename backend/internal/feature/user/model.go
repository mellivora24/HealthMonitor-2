package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	FullName     string     `json:"full_name" db:"full_name"`
	DateOfBirth  *time.Time `json:"date_of_birth,omitempty" db:"date_of_birth"`
	Gender       *string    `json:"gender,omitempty" db:"gender"`
	Phone        *string    `json:"phone,omitempty" db:"phone"`
	Height       *float64   `json:"height,omitempty" db:"height"`
	Weight       *float64   `json:"weight,omitempty" db:"weight"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

type CreateUserRequest struct {
	Email       string     `json:"email" validate:"required,email"`
	Password    string     `json:"password" validate:"required,min=6"`
	FullName    string     `json:"full_name" validate:"required"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Gender      *string    `json:"gender,omitempty"`
	Phone       *string    `json:"phone,omitempty"`
	Height      *float64   `json:"height,omitempty"`
	Weight      *float64   `json:"weight,omitempty"`
}

type UpdateUserRequest struct {
	FullName    *string    `json:"full_name,omitempty"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Gender      *string    `json:"gender,omitempty"`
	Phone       *string    `json:"phone,omitempty"`
	Height      *float64   `json:"height,omitempty"`
	Weight      *float64   `json:"weight,omitempty"`
}
