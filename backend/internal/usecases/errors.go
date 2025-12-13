package usecases

import "errors"

// Auth
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrUserNotFound       = errors.New("user not found")
)

// Account
var (
	ErrAccountNotFound = errors.New("account not found")
	ErrForbidden       = errors.New("forbidden")
)

// Transaction
var (
	ErrTransactionNotFound = errors.New("transaction not found")
)
