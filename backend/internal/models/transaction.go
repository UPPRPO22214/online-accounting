package models

import (
	"database/sql"
	"time"
)

type CreateTransactionParams struct {
	AccountID  int
	UserID     int
	Title      string
	Amount     string
	OccurredAt time.Time
	Category   sql.NullString
	IsPeriodic bool
}

type ListTransactionsFilter struct {
	AccountID  int
	DateFrom   *time.Time
	DateTo     *time.Time
	IsPeriodic *bool
	Type       *string   // "income" | "expense"
	Categories []string
}
