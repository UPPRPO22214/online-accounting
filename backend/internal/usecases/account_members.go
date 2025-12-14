package usecases

import (
	"context"
	"database/sql"
	"errors"

	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/repository/query"
)

type AccountMemberService struct {
	members *repository.AccountMemberRepository
	users   *repository.UserRepository
}

func newAccountMemberService(repo *repository.Repository) *AccountMemberService {
	return &AccountMemberService{
		members: repo.AccountMemberRepo,
		users:   repo.UserRepo,
	}
}

func (s *AccountMemberService) Invite(
	ctx context.Context,
	accountID int,
	ownerID int,
	inviteeEmail string,
	role query.AccountMembersRole,
) error {

	if err := s.requireOwner(ctx, accountID, ownerID); err != nil {
		return err
	}

	user, err := s.users.GetUserByEmail(ctx, inviteeEmail)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}

	return s.members.AddMember(ctx, accountID, user.ID, role)
}

func (s *AccountMemberService) ChangeRole(
	ctx context.Context,
	accountID int,
	ownerID int,
	userID int,
	role query.AccountMembersRole,
) error {

	if err := s.requireOwner(ctx, accountID, ownerID); err != nil {
		return err
	}

	return s.members.UpdateMemberRole(ctx, accountID, userID, role)
}

func (s *AccountMemberService) Remove(
	ctx context.Context,
	accountID int,
	ownerID int,
	userID int,
) error {

	if err := s.requireOwner(ctx, accountID, ownerID); err != nil {
		return err
	}

	return s.members.RemoveMember(ctx, accountID, userID)
}

// maybe IsMember
func (s *AccountMemberService) requireOwner(
	ctx context.Context,
	accountID int,
	userID int,
) error {

	role, err := s.members.GetMemberRole(ctx, accountID, userID)
	if err != nil {
		return ErrForbidden
	}

	if role != query.AccountMembersRoleOwner {
		return ErrForbidden
	}

	return nil
}
