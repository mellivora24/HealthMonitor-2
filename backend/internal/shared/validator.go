package shared

import "github.com/go-playground/validator/v10"

type Validator interface {
	Validate(interface{}) error
}

type validatorAdapter struct {
	v *validator.Validate
}

func NewValidator() Validator {
	return &validatorAdapter{
		v: validator.New(),
	}
}

func (va *validatorAdapter) Validate(i interface{}) error {
	return va.v.Struct(i)
}
