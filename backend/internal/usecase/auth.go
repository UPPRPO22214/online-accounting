package usecase

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"time"

	"microservices/auth/internal/models"
	"microservices/auth/internal/repository"
)

type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(hash, password string) bool
}

type TokenManager interface {
	GenerateAccessToken(userID int) (string, error)
	GenerateRefreshToken() (string, error)
	RefreshTTL() time.Duration
}

type AuthService struct {
	repo        *repository.Repository
	hasher      PasswordHasher
	tokenMgr    TokenManager
}

func NewAuthService(
	repo *repository.Repository,
	hasher PasswordHasher,
	tokenMgr TokenManager,
) *AuthService {
	return &AuthService{
		repo:       repo,
		hasher:     hasher,
		tokenMgr:   tokenMgr,
	}
}

func (s *AuthService) Register(ctx context.Context, email, password string) (*models.Tokens, error) {
	_, err := s.repo.UserRepo.GetUserByEmail(ctx, email)
	if err == nil {
		return nil, sql.ErrNoRows // будет интерпретировано как AlreadyExists
	}

	passwordHash, err := s.hasher.Hash(password)
	if err != nil {
		return nil, err
	}

	var tokens *models.Tokens

	err = s.transactor.Do(ctx, nil, func(tx repository.TxRepository) error {
		userID, err := tx.UserRepo.CreateUser(ctx, &models.CreateUser{
			Email:        email,
			PasswordHash: passwordHash,
		})
		if err != nil {
			return err
		}

		tokens, err = s.issueTokens(ctx, tx, userID)
		return err
	})

	return tokens, err
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*models.Tokens, error) {
	user, err := s.repo.UserRepo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !s.hasher.Compare(user.PasswordHash, password) {
		return nil, ErrInvalidCredentials
	}

	var tokens *models.Tokens

	err = s.transactor.Do(ctx, nil, func(tx repository.TxRepository) error {
		tokens, err = s.issueTokens(ctx, tx, user.ID)
		return err
	})

	return tokens, err
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*models.Tokens, error) {
	tokenHash := hashToken(refreshToken)

	var tokens *models.Tokens

	err := s.transactor.Do(ctx, nil, func(tx repository.TxRepository) error {
		token, err := tx.RefreshTokenRepo.GetToken(ctx, 0, tokenHash)
		if err != nil {
			return ErrInvalidToken
		}

		if token.IsRefreshed {
			return ErrTokenAlreadyUsed
		}

		if token.RevokedAt != nil || token.ExpiresAt.Before(time.Now()) {
			return ErrInvalidToken
		}

		if err := tx.RefreshTokenRepo.UseValidToken(ctx, token.UserID, tokenHash); err != nil {
			return ErrTokenAlreadyUsed
		}

		tokens, err = s.issueTokens(ctx, tx, token.UserID)
		return err
	})

	return tokens, err
}

func (s *AuthService) CheckUserExists(ctx context.Context, userID int) (bool, error) {
	return s.repo.UserRepo.UserExistsByID(ctx, userID)
}

func (s *AuthService) GetUser(ctx context.Context, userID int) (*models.User, error) {
	exists, err := s.repo.UserRepo.UserExistsByID(ctx, userID)
	if err != nil || !exists {
		return nil, ErrUserNotFound
	}

	// если нужно — можно расширить репозиторий
	return &models.User{ID: userID}, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID int, newPassword string) error {
	hash, err := s.hasher.Hash(newPassword)
	if err != nil {
		return err
	}

	return s.repo.UserRepo.UpdateUserPassword(ctx, userID, hash)
}

func (s *AuthService) issueTokens(
	ctx context.Context,
	tx repository.TxRepository,
	userID int,
) (*models.Tokens, error) {

	access, err := s.tokenMgr.GenerateAccessToken(userID)
	if err != nil {
		return nil, err
	}

	refresh, err := s.tokenMgr.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	err = tx.RefreshTokenRepo.GenerateToken(ctx, &models.GenerateToken{
		UserID:    userID,
		TokenHash: hashToken(refresh),
		ExpiresAt: time.Now().Add(s.tokenMgr.RefreshTTL()),
	})
	if err != nil {
		return nil, err
	}

	return &models.Tokens{
		AccessToken:  access,
		RefreshToken: refresh,
	}, nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

