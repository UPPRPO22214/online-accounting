package models

type CreateUser struct {
	Email        string
	PasswordHash string
}

type User struct {
	ID           int
	Email        string
	PasswordHash string
}
