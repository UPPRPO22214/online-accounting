package usecases

import (
	"context"
	"database/sql"
	"errors"

	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/repository/query"
)

type AccountService struct {
	accounts *repository.AccountRepository
	members  *repository.AccountMemberRepository
}

func newAccountService(repo *repository.Repository) *AccountService {
	return &AccountService{
		accounts: repo.AccountRepo,
		members:  repo.AccountMemberRepo,
	}
}

func (s *AccountService) CreateAccount(ctx context.Context, userID int, name string, description *string) (int, error) {
	accountID, err := s.accounts.CreateAccount(ctx, userID, name, description)
	if err != nil {
		return 0, err
	}

	// creator = owner
	err = s.members.AddMember(
		ctx,
		accountID,
		userID,
		query.AccountMembersRoleOwner,
	)
	if err != nil {
		return 0, err
	}

	return accountID, nil
}

func (s *AccountService) GetAccountByID(ctx context.Context, accountID int) (*query.Account, error) {
	acc, err := s.accounts.GetAccountByID(ctx, accountID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrAccountNotFound
		}
		return nil, err
	}

	return acc, nil
}

func (s *AccountService) ListForUser(ctx context.Context, userID int) ([]query.ListUserAccountsRow, error) {
	return s.accounts.ListUserAccounts(ctx, userID)
}

func (s *AccountService) ListMembers(ctx context.Context, accountID int, userID int) ([]query.ListAccountMembersRow, error) {
	// Проверяем, что пользователь вообще участник счёта
	_, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return nil, ErrForbidden
	}

	return s.members.ListMembers(ctx, accountID)
}

func (s *AccountService) DeleteAccount(ctx context.Context, accountID int, userID int) error {
	role, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrForbidden
		}
		return err
	}

	if role != query.AccountMembersRoleOwner {
		return ErrForbidden
	}

	return s.accounts.DeleteAccountByID(ctx, accountID)
}
