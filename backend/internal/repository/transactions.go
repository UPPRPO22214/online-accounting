package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"microservices/accounter/internal/models"
	"microservices/accounter/internal/repository/query"
)

type TransactionRepository struct {
	queries *query.Queries
	db      query.DBTX
}

func newTransactionRepository(db query.DBTX) *TransactionRepository {
	return &TransactionRepository{
		queries: query.New(db),
		db:      db,
	}
}

// CreateTransaction создаёт одну транзакцию
func (r *TransactionRepository) CreateTransaction(ctx context.Context, p *models.CreateTransactionParams) (int, error) {
	result, err := r.queries.CreateTransaction(ctx, query.CreateTransactionParams{
		AccountID:  int32(p.AccountID),
		UserID:     int32(p.UserID),
		Title:      p.Title,
		Amount:     p.Amount,
		OccurredAt: p.OccurredAt,
		Period:     p.Period,
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

// CreatePeriodicTransactions создаёт серию периодических транзакций (500 штук)
func (r *TransactionRepository) CreatePeriodicTransactions(
	ctx context.Context,
	p *models.CreateTransactionParams,
	count int,
) (int, error) {
	currentDate := p.OccurredAt

	id, err := r.CreateTransaction(ctx, p)
	if err != nil {
		return 0, err
	}

	values := make([]interface{}, 0, count*6)
	placeholders := make([]string, 0, count)
	currentDate = calculateNextDate(currentDate, p.Period.TransactionsPeriod)

	for i := 0; i < count-1; i++ {
		placeholders = append(placeholders, "(?, ?, ?, ?, ?, ?)")
		values = append(values,
			p.AccountID,
			p.UserID,
			p.Title,
			p.Amount,
			currentDate,
			p.Period.TransactionsPeriod,
		)
		currentDate = calculateNextDate(currentDate, p.Period.TransactionsPeriod)
	}

	// Один SQL запрос
	sql := fmt.Sprintf(
		`INSERT INTO transactions (account_id, user_id, title, amount, occurred_at, period)
         VALUES %s`,
		strings.Join(placeholders, ", "),
	)

	_, err = r.db.ExecContext(ctx, sql, values...)

	return id, nil
}

// GetByID получает транзакцию по ID
func (r *TransactionRepository) GetByID(ctx context.Context, id int32) (*query.Transaction, error) {
	transaction, err := r.queries.GetTransactionByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

// UpdateTransaction обновляет поля транзакции
func (r *TransactionRepository) UpdateTransaction(
	ctx context.Context,
	id int32,
	params *models.UpdateTransactionParams,
) error {
	sql := `
		UPDATE transactions
		SET title = ?, amount = ?, occurred_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(ctx, sql,
		params.Title,
		params.Amount,
		params.OccurredAt,
		id,
	)

	return err
}

// List возвращает список транзакций с фильтрацией
func (r *TransactionRepository) List(ctx context.Context, f *models.ListTransactionsFilter) ([]query.Transaction, error) {
	// Подготовка параметров для запроса
	var userIDParam interface{}
	var userIDValue int32
	if f.UserID != nil {
		userIDParam = *f.UserID
		userIDValue = int32(*f.UserID)
	}

	var dateFromParam interface{}
	var dateFromValue time.Time
	if f.DateFrom != nil {
		dateFromParam = *f.DateFrom
		dateFromValue = *f.DateFrom
	}

	var dateToParam interface{}
	var dateToValue time.Time
	if f.DateTo != nil {
		dateToParam = *f.DateTo
		dateToValue = *f.DateTo
	}

	var typeParam interface{}
	var typeValue1 interface{}
	var typeValue2 interface{}
	if f.Type != nil {
		typeParam = *f.Type
		typeValue1 = *f.Type
		typeValue2 = *f.Type
	}

	return r.queries.ListTransactions(ctx, query.ListTransactionsParams{
		AccountID:    int32(f.AccountID),
		Column2:      userIDParam,
		UserID:       userIDValue,
		Column4:      dateFromParam,
		OccurredAt:   dateFromValue,
		Column6:      dateToParam,
		OccurredAt_2: dateToValue,
		Column8:      typeParam,
		Column9:      typeValue1,
		Column10:     typeValue2,
	})
}

// DeleteByID удаляет транзакцию по ID
func (r *TransactionRepository) DeleteByID(ctx context.Context, id int) error {
	return r.queries.DeleteTransactionByID(ctx, int32(id))
}

// calculateNextDate вычисляет следующую дату для периодической транзакции
func calculateNextDate(current time.Time, period query.TransactionsPeriod) time.Time {
	switch period {
	case query.TransactionsPeriodDay:
		return current.AddDate(0, 0, 1)
	case query.TransactionsPeriodWeek:
		return current.AddDate(0, 0, 7)
	case query.TransactionsPeriodMonth:
		return current.AddDate(0, 1, 0)
	case query.TransactionsPeriodYear:
		return current.AddDate(1, 0, 0)
	default:
		return current
	}
}
