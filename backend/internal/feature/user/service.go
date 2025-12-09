package user

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	Register(req RegisterRequest) (*User, string, error)
	Login(req LoginRequest) (*User, string, error)
	GetProfile(userID uuid.UUID) (*UserResponse, error)
	UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*UserResponse, error)
	ChangePassword(userID uuid.UUID, req ChangePasswordRequest) error
}

type service struct {
	repo            Repository
	hashPassword    func(password string) (string, error)
	comparePassword func(hashedPassword, password string) bool
	generateToken   func(userID uuid.UUID) (string, error)
}

func NewService(repo Repository, hashPassword func(string) (string, error),
	comparePassword func(string, string) bool, generateToken func(uuid.UUID) (string, error)) Service {
	return &service{
		repo:            repo,
		hashPassword:    hashPassword,
		comparePassword: comparePassword,
		generateToken:   generateToken,
	}
}

func (s *service) Register(req RegisterRequest) (*User, string, error) {
	existingUser, _ := s.repo.FindByEmail(req.Email)
	if existingUser != nil {
		return nil, "", errors.New("email already exists")
	}

	hashedPassword, err := s.hashPassword(req.Password)
	if err != nil {
		return nil, "", err
	}

	user := &User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, "", err
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *service) Login(req LoginRequest) (*User, string, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("invalid email or password")
		}
		return nil, "", err
	}

	if !s.comparePassword(user.PasswordHash, req.Password) {
		return nil, "", errors.New("invalid email or password")
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *service) GetProfile(userID uuid.UUID) (*UserResponse, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	return &UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		FullName:    user.FullName,
		DateOfBirth: user.DateOfBirth,
		Gender:      user.Gender,
		Phone:       user.Phone,
		Height:      user.Height,
		Weight:      user.Weight,
		CreatedAt:   user.CreatedAt,
	}, nil
}

func (s *service) UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*UserResponse, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.DateOfBirth != nil {
		user.DateOfBirth = req.DateOfBirth
	}
	if req.Gender != "" {
		user.Gender = req.Gender
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Height != nil {
		user.Height = req.Height
	}
	if req.Weight != nil {
		user.Weight = req.Weight
	}
	user.UpdatedAt = time.Now()

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}

	return &UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		FullName:    user.FullName,
		DateOfBirth: user.DateOfBirth,
		Gender:      user.Gender,
		Phone:       user.Phone,
		Height:      user.Height,
		Weight:      user.Weight,
		CreatedAt:   user.CreatedAt,
	}, nil
}

func (s *service) ChangePassword(userID uuid.UUID, req ChangePasswordRequest) error {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return err
	}

	if !s.comparePassword(user.PasswordHash, req.OldPassword) {
		return errors.New("old password is incorrect")
	}

	hashedPassword, err := s.hashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(userID, hashedPassword)
}
