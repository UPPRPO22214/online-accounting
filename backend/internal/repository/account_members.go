package repository

import (
	"context"
	"database/sql"
	"errors"

	"microservices/accounter/internal/repository/query"
)

type AccountMemberRepository struct {
	queries *query.Queries
}

func newAccountMemberRepository(db query.DBTX) *AccountMemberRepository {
	return &AccountMemberRepository{
		queries: query.New(db),
	}
}

func (r *AccountMemberRepository) AddMember(
	ctx context.Context,
	accountID int,
	userID int,
	role query.AccountMembersRole,
) error {

	return r.queries.AddAccountMember(ctx, query.AddAccountMemberParams{
		AccountID: int32(accountID),
		UserID:    int32(userID),
		Role:      role,
	})
}

func (r *AccountMemberRepository) GetMemberRole(
	ctx context.Context,
	accountID int,
	userID int,
) (query.AccountMembersRole, error) {

	role, err := r.queries.GetAccountMemberRole(ctx, query.GetAccountMemberRoleParams{
		AccountID: int32(accountID),
		UserID:    int32(userID),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", sql.ErrNoRows
		}
		return "", err
	}

	return role, nil
}

func (r *AccountMemberRepository) UpdateMemberRole(
	ctx context.Context,
	accountID int,
	userID int,
	role query.AccountMembersRole,
) error {

	return r.queries.UpdateAccountMemberRole(ctx, query.UpdateAccountMemberRoleParams{
		Role:      role,
		AccountID: int32(accountID),
		UserID:    int32(userID),
	})
}

func (r *AccountMemberRepository) RemoveMember(ctx context.Context, accountID int, userID int) error {
	return r.queries.RemoveAccountMember(ctx, query.RemoveAccountMemberParams{
		AccountID: int32(accountID),
		UserID:    int32(userID),
	})
}
