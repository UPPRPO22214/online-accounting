package models

import (
	"time"

	"microservices/accounter/internal/repository/query"
)

type CreateTransactionParams struct {
	AccountID  int
	UserID     int
	Title      string
	Amount     string
	OccurredAt time.Time
	Period     query.NullTransactionsPeriod
}

type ListTransactionsFilter struct {
	AccountID  int
	UserID     *int
	DateFrom   *time.Time
	DateTo     *time.Time
	Type       *string    // "income" | "expense"
}
