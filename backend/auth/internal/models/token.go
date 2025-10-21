package models

import "time"

type GenerateToken struct {
	UserID    int
	TokenHash string
	ExpiresAt time.Time
}

type RefreshToken struct {
	UserID      int
	TokenHash   string
	IsRefreshed bool
	CreatedAt   time.Time
	ExpiresAt   time.Time
	RevokedAt   *time.Time
}
