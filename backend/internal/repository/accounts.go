package repository

import (
	"context"
	"database/sql"
	"errors"

	"microservices/accounter/internal/repository/query"
)

type AccountRepository struct {
	queries *query.Queries
}

func newAccountRepository(db query.DBTX) *AccountRepository {
	return &AccountRepository{
		queries: query.New(db),
	}
}

func (r *AccountRepository) CreateAccount(
	ctx context.Context,
	ownerID int,
	name string,
	description *string,
) (int, error) {

	desc := sql.NullString{}
	if description != nil {
		desc.String = *description
		desc.Valid = true
	}

	result, err := r.queries.CreateAccount(ctx, query.CreateAccountParams{
		Name:        name,
		Description: desc,
		OwnerID:     int32(ownerID),
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

func (r *AccountRepository) GetAccountByID(ctx context.Context, accountID int) (*query.Account, error) {

	acc, err := r.queries.GetAccountByID(ctx, int32(accountID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &acc, nil
}

func (r *AccountRepository) DeleteAccountByID(ctx context.Context, accountID int) error {
	return r.queries.DeleteAccountByID(ctx, int32(accountID))
}
