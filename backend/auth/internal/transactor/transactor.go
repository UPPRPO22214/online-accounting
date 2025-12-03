package transactor

import (
	"context"
	"database/sql"

	"microservices/auth/internal/database"
	"microservices/auth/internal/repository"
)

type Transactor struct {
	db   *database.Database
	repo *repository.Repository
}

func New(db *database.Database, repo *repository.Repository) *Transactor {
	return &Transactor{
		db:   db,
		repo: repo,
	}
}

func (t *Transactor) Do(ctx context.Context, opts *sql.TxOptions, fn func(repository.TxRepository) error) error {
	tx, err := t.db.DB().BeginTx(ctx, opts)
	if err != nil {
		return err
	}

	defer func() {
		err = tx.Rollback()
	}()

	err = fn(t.repo.WithTx(tx)) // may panic?
	if err != nil {
		return err
	}

	err = tx.Commit()

	return err
}
