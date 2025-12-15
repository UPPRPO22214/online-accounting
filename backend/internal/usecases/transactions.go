package usecases

import (
	"context"
	"database/sql"
	"errors"
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

// Create создаёт транзакцию. Если указан период, создаёт 500 периодических записей
func (s *TransactionService) Create(
	ctx context.Context,
	accountID int,
	userID int,
	title string,
	amount string,
	occurredAt time.Time,
	period query.NullTransactionsPeriod,
) (int, error) {

	// Проверка прав доступа
	role, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return 0, ErrForbidden
	}

	if role == query.AccountMembersRoleViewer {
		return 0, ErrForbidden
	}

	params := &models.CreateTransactionParams{
		AccountID:  accountID,
		UserID:     userID,
		Title:      title,
		Amount:     amount,
		OccurredAt: occurredAt,
		Period:     period,
	}

	// Если период не указан - создаём одну транзакцию
	if !period.Valid {
		return s.transactions.CreateTransaction(ctx, params)
	}

	// Если период указан - создаём 500 периодических транзакций
	return s.transactions.CreatePeriodicTransactions(ctx, params, 500)
}

// GetByID получает транзакцию по ID
func (s *TransactionService) GetByID(ctx context.Context, id int32) (*query.Transaction, error) {

	transaction, err := s.transactions.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrTransactionNotFound
		}
		return nil, err
	}

	return transaction, nil
}

// List возвращает список транзакций с фильтрацией
func (s *TransactionService) List(
	ctx context.Context,
	accountID int,
	userID int,
	params *models.ListTransactionsFilter,
) ([]query.Transaction, error) {

	// Проверка, что пользователь является участником счёта
	_, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return nil, ErrForbidden
	}

	return s.transactions.List(ctx, params)
}

// Update обновляет транзакцию с проверкой прав доступа
func (s *TransactionService) Update(
	ctx context.Context,
	transactionID int32,
	accountID int,
	userID int,
	transactionOwnerID int,
	params *models.UpdateTransactionParams,
) error {

	role, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return ErrForbidden
	}

	// Viewer не может редактировать
	if role == query.AccountMembersRoleViewer {
		return ErrForbidden
	}

	// Editor может редактировать только свои транзакции
	if role == query.AccountMembersRoleEditor && userID != transactionOwnerID {
		return ErrForbidden
	}

	// Admin и Owner могут редактировать любые транзакции
	return s.transactions.UpdateTransaction(ctx, transactionID, params)
}

// Delete удаляет транзакцию с проверкой прав
func (s *TransactionService) Delete(
	ctx context.Context,
	accountID int,
	userID int,
	transactionOwnerID int,
	transactionID int,
) error {

	role, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return ErrForbidden
	}

	// Viewer не может удалять
	if role == query.AccountMembersRoleViewer {
		return ErrForbidden
	}

	// Editor может удалять только свои транзакции
	if role == query.AccountMembersRoleEditor && userID != transactionOwnerID {
		return ErrForbidden
	}

	// Admin и Owner могут удалять любые транзакции
	return s.transactions.DeleteByID(ctx, transactionID)
}
