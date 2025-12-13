package models

import "time"

type Token struct {
	AccessToken  string
}

type GenerateToken struct {
	UserID    int
	TokenHash string
	ExpiresAt time.Time
}
