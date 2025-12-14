package repository

import (
	"context"
	"time"

	"microservices/accounter/internal/models"
	"microservices/accounter/internal/repository/query"
)

type TransactionRepository struct {
	queries *query.Queries
}

func newTransactionRepository(db query.DBTX) *TransactionRepository {
	return &TransactionRepository{
		queries: query.New(db),
	}
}

func (r *TransactionRepository) CreateTransaction(ctx context.Context, p *models.CreateTransactionParams) (int, error) {
	result, err := r.queries.CreateTransaction(ctx, query.CreateTransactionParams{
		AccountID:  int32(p.AccountID),
		UserID:     int32(p.UserID),
		Title:      p.Title,
		Amount:     p.Amount,
		OccurredAt: p.OccurredAt,
		IsPeriodic: p.IsPeriodic,
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

func (r *TransactionRepository) GetByID(ctx context.Context, id int32) (*query.Transaction, error) {
	transaction, err := r.queries.GetTransactionByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &transaction, nil
}

func (r *TransactionRepository) List(ctx context.Context, f *models.ListTransactionsFilter) ([]query.Transaction, error) {

}

func (r *TransactionRepository) DeleteByID(ctx context.Context, id int) error {
	return r.queries.DeleteTransactionByID(ctx, int32(id))
}

func valueOrZero(t *time.Time) time.Time {
	if t == nil {
		return time.Time{}
	}
	return *t
}

func valueOrFalse(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}
