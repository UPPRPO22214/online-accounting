package usecases

import (
	"context"
	"database/sql"
	"time"

	"microservices/accounter/internal/models"
	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/repository/query"
)

type TransactionService struct {
	transactions *repository.TransactionRepository
	members      *repository.AccountMemberRepository
}

func newTransactionService(repo *repository.Repository) *TransactionService {
	return &TransactionService{
		transactions: repo.TransactionRepo,
		members:      repo.AccountMemberRepo,
	}
}

func (s *TransactionService) Create(
	ctx context.Context,
	accountID int,
	userID int,
	title string,
	amount string,
	occurredAt time.Time,
	category *string,
	isPeriodic bool,
) (int, error) {

	role, err := s.requireViewer(ctx, accountID, userID)
	if err != nil {
		return 0, err
	}
	if role == query.AccountMembersRoleViewer {
		return 0, ErrForbidden
	}

	var cat sql.NullString
	if category != nil {
		cat = sql.NullString{String: *category, Valid: true}
	}

	return s.transactions.CreateTransaction(ctx, &models.CreateTransactionParams{
		AccountID:  accountID,
		UserID:     userID,
		Title:      title,
		Amount:     amount,
		OccurredAt: occurredAt,
		Category:   cat,
		IsPeriodic: isPeriodic,
	})
}

func (s *TransactionService) List(
	ctx context.Context,
	accountID int,
	userID int,
	params *models.ListTransactionsFilter,
) ([]query.Transaction, error) {

	if _, err := s.requireViewer(ctx, accountID, userID); err != nil {
		return nil, err
	}

	return s.transactions.List(ctx, params)
}

func (s *TransactionService) Delete(
	ctx context.Context,
	accountID int,
	userID int,
	transactionOwnerID int,
	transactionID int,
) error {

	role, err := s.requireViewer(ctx, accountID, userID)
	if err != nil {
		return err
	}

	if role == query.AccountMembersRoleViewer {
		return ErrForbidden
	}

	if role == query.AccountMembersRoleEditor && userID != transactionOwnerID {
		return ErrForbidden
	}

	return s.transactions.DeleteByID(ctx, transactionID)
}

func (s *TransactionService) requireViewer(
	ctx context.Context,
	accountID int,
	userID int,
) (query.AccountMembersRole, error) {

	role, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return "", ErrForbidden
	}

	return role, nil
}
