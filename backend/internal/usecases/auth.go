package usecases

import (
	"context"
	"database/sql"
	"errors"

	"microservices/accounter/internal/crypto"
	"microservices/accounter/internal/models"
	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/tokens"
)

type AuthService struct {
	users  *repository.UserRepository
	tokens *tokens.JWTManager
}

func newAuthService(users *repository.UserRepository, tokens  *tokens.JWTManager) *AuthService {
	return &AuthService{
		users:  users,
		tokens: tokens,
	}
}

func (s *AuthService) Register(ctx context.Context, email string, password string) (string, error) {

	_, err := s.users.GetUserByEmail(ctx, email)
	if err == nil {
		return "", ErrUserAlreadyExists
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return "", err
	}

	hash, err := crypto.Hash(password)
	if err != nil {
		return "", err
	}

	userID, err := s.users.CreateUser(ctx, &models.CreateUser{
		Email:        email,
		PasswordHash: hash,
	})
	if err != nil {
		return "", err
	}

	return s.tokens.Generate(userID)
}

func (s *AuthService) Login(ctx context.Context, email string, password string) (string, error) {

	user, err := s.users.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrInvalidCredentials
		}
		return "", err
	}

	if !crypto.Compare(user.PasswordHash, password) {
		return "", ErrInvalidCredentials
	}

	return s.tokens.Generate(user.ID)
}

func (s *AuthService) ChangePassword(ctx context.Context, userID int, newPassword string) error {

	exists, err := s.users.UserExistsByID(ctx, userID)
	if err != nil {
		return err
	}
	if !exists {
		return ErrUserNotFound
	}

	hash, err := crypto.Hash(newPassword)
	if err != nil {
		return err
	}

	return s.users.UpdateUserPassword(ctx, userID, hash)
}

func (s *AuthService) CheckUserExists(ctx context.Context, userID int) (bool, error) {
	return s.users.UserExistsByID(ctx, userID)
}

