package repository

import (
	"database/sql"

	"microservices/auth/internal/repository/query"
)

type UserRepository struct {
	db *sql.DB
	queries *query.Queries
}

func New(db *sql.DB) *UserRepository {
	return &UserRepository{db: db, queries: query.New(db)}
}

