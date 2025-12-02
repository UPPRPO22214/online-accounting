package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"microservices/auth/internal/models"
	"microservices/auth/internal/repository/query"
)

type UserRepository struct {
	queries *query.Queries
}

func newUserRepository(db query.DBTX) *UserRepository {
	return &UserRepository{queries: query.New(db)}
}

func (r *UserRepository) WithTx(tx *sql.Tx) *UserRepository {
	return &UserRepository{queries: r.queries.WithTx(tx)}
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &models.User{
		ID:           int(user.ID),
		Email:        user.Email,
		PasswordHash: user.PasswordHash,
	}, nil
}

func (r *UserRepository) UserExistsByID(ctx context.Context, id int) (bool, error) {
	exists, err := r.queries.CheckUserByID(ctx, int32(id))
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, params *models.CreateUser) (int, error) {
	result, err := r.queries.CreateUser(ctx, query.CreateUserParams{
		Email:        params.Email,
		PasswordHash: params.PasswordHash,
	})
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id), nil
}

func (r *UserRepository) UpdateUserPassword(ctx context.Context, id int, passwordHash string) error {
	result, err := r.queries.UpdateUserPassword(ctx, query.UpdateUserPasswordParams{
		PasswordHash: passwordHash,
		ID:           int32(id),
	})
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows != 1 {
		return fmt.Errorf("expected to affect 1 user, affected %d", rows)
	}
	
	return nil
}
