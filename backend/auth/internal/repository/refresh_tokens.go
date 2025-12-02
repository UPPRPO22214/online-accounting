package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"microservices/auth/internal/models"
	"microservices/auth/internal/repository/query"
)

type RefreshTokenRepository struct {
	queries *query.Queries
}

func newRefreshTokenRepository(db query.DBTX) *RefreshTokenRepository {
	return &RefreshTokenRepository{queries: query.New(db)}
}

func (r *RefreshTokenRepository) WithTx(tx *sql.Tx) *RefreshTokenRepository {
	return &RefreshTokenRepository{queries: r.queries.WithTx(tx)}
}

func (r *RefreshTokenRepository) GenerateToken(ctx context.Context, params *models.GenerateToken) error {
	return r.queries.GenerateRefreshToken(ctx, query.GenerateRefreshTokenParams{
		UserID:    int32(params.UserID),
		TokenHash: params.TokenHash,
		ExpiresAt: params.ExpiresAt,
	})
}

func (r *RefreshTokenRepository) GetToken(ctx context.Context, userID int, tokenHash string) (*models.RefreshToken, error) {
	token, err := r.queries.GetRefreshToken(ctx, query.GetRefreshTokenParams{
		UserID:    int32(userID),
		TokenHash: tokenHash,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	refreshToken := &models.RefreshToken{
		UserID:      int(token.UserID),
		TokenHash:   token.TokenHash,
		IsRefreshed: token.IsRefreshed,
		CreatedAt:   token.CreatedAt,
		ExpiresAt:   token.ExpiresAt,
	}
	if token.RevokedAt.Valid {
		refreshToken.RevokedAt = &token.RevokedAt.Time
	}
	return refreshToken, nil
}

// Возвращает nil, если токен был успешно использован (RowsAffected > 0)
func (r *RefreshTokenRepository) UseValidToken(ctx context.Context, userID int, tokenHash string) error {
	result, err := r.queries.UseValidRefreshToken(ctx, query.UseValidRefreshTokenParams{
		UserID:    int32(userID),
		TokenHash: tokenHash,
	})
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows != 1 {
		return fmt.Errorf("expected to affect 1 token, affected %d", rows)
	}
	
	return nil
}

// RevokeRefreshToken отзывает refresh-токен (устанавливает revoked_at)
func (r *RefreshTokenRepository) RevokeToken(ctx context.Context, userID int, tokenHash string) error {
	return r.queries.RevokeRefreshToken(ctx, query.RevokeRefreshTokenParams{
		UserID:    int32(userID),
		TokenHash: tokenHash,
	})
}
