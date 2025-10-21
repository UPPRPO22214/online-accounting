package models

import "time"

type CreateUser struct {
	Email        string
	PasswordHash string
}

type GenerateToken struct {
	UserID    int
	TokenHash string
	ExpiresAt time.Time
}
