package repository

import (
	"database/sql"
	"microservices/auth/internal/repository/query"
)

type Repository struct {
	UserRepo         *UserRepository
	RefreshTokenRepo *RefreshTokenRepository
}

type TxRepository struct {
	UserRepo UserRepository
	RefreshTokenRepo RefreshTokenRepository
}

func New(db query.DBTX) *Repository {
	return &Repository{
		UserRepo:         newUserRepository(db),
		RefreshTokenRepo: newRefreshTokenRepository(db),
	}
}

func (r *Repository) WithTx(tx *sql.Tx) TxRepository {
	return TxRepository{
		UserRepo:         r.UserRepo.WithTx(tx),
		RefreshTokenRepo: r.RefreshTokenRepo.WithTx(tx),
	}
}
