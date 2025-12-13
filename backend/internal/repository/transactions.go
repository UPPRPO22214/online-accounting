package repository

import (
	"context"
	"database/sql"
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
		Category:   p.Category,
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

func (r *TransactionRepository) List(ctx context.Context, f *models.ListTransactionsFilter) ([]query.Transaction, error) {

	var (
		col2, col4, col6, col8, col9, col10, col11 interface{}
	)

	if f.DateFrom != nil {
		col2 = *f.DateFrom
	}
	if f.DateTo != nil {
		col4 = *f.DateTo
	}
	if f.IsPeriodic != nil {
		col6 = true
		col8 = *f.IsPeriodic
	}
	if f.Type != nil {
		col9 = *f.Type
		col10 = *f.Type
		col11 = *f.Type
	}

	categories := make([]sql.NullString, 0, len(f.Categories))
	for _, c := range f.Categories {
		categories = append(categories, sql.NullString{
			String: c,
			Valid:  true,
		})
	}

	return r.queries.ListTransactions(ctx, query.ListTransactionsParams{
		AccountID:    int32(f.AccountID),
		Column2:      col2,
		OccurredAt:   valueOrZero(f.DateFrom),
		Column4:      col4,
		OccurredAt_2: valueOrZero(f.DateTo),
		Column6:      col6,
		IsPeriodic:   valueOrFalse(f.IsPeriodic),
		Column8:      col8,
		Column9:      col9,
		Column10:     col10,
		Column11:     col11,
		Categories:   categories,
	})
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
