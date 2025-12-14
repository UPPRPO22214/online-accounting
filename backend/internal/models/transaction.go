package models

import (
	"time"
)

type CreateTransactionParams struct {
	AccountID  int
	UserID     int
	Title      string
	Amount     string
	OccurredAt time.Time
	IsPeriodic bool
}

type ListTransactionsFilter struct {
	AccountID int
	DateFrom  *time.Time
	DateTo    *time.Time
	Type      *string // "income", "expense"
}
