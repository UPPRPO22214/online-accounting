package repository

import (
	"microservices/auth/internal/repository/query"
)

type Repository struct {
	UserRepo         *UserRepository
}

func New(db query.DBTX) *Repository {
	return &Repository{
		UserRepo:         newUserRepository(db),
	}
}
