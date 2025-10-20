package repository

import (
	"database/sql"

	"microservices/auth/internal/repository/query"
)

type UserRepository struct {
	queries *query.Queries
}

func New(db *sql.DB) *UserRepository {
	return &UserRepository{queries: query.New(db)}
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	user, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}
	return &User{
		ID:           user.ID,
		Email:        user.Email,
		PasswordHash: user.PasswordHash,
	}, nil
}

func (r *UserRepository) UserExistsByID(ctx context.Context, id int64) (bool, error) {
	exists, err := r.queries.CheckUserByID(ctx, id)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, params UserCreateParams) (int64, error) {
	result, err := r.queries.CreateUser(ctx, db.CreateUserParams{
		ID:           params.ID,
		Email:        params.Email,
		PasswordHash: params.PasswordHash,
	})
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *UserRepository) UpdateUserPassword(ctx context.Context, id int64, passwordHash string) (int64, error) {
	result, err := r.queries.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
		PasswordHash: passwordHash,
		ID:           id,
	})
	if err != nil {
		return 0, err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return 0, err
	}
	return rows, nil
}

func (r *UserRepository) GenerateRefreshToken(ctx context.Context, userID int64, tokenHash string, expiresAt time.Time) error {
	return r.queries.GenerateRefreshToken(ctx, db.GenerateRefreshTokenParams{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
	})
}

// Возвращает true, если токен был успешно использован (RowsAffected > 0)
func (r *UserRepository) UseValidRefreshToken(ctx context.Context, userID int64, tokenHash string) (bool, error) {
	result, err := r.queries.UseValidRefreshToken(ctx, db.UseValidRefreshTokenParams{
		UserID:    userID,
		TokenHash: tokenHash,
	})
	if err != nil {
		return false, err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return rows > 0, nil
}

// RevokeRefreshToken отзывает refresh-токен (устанавливает revoked_at)
func (r *UserRepository) RevokeRefreshToken(ctx context.Context, userID int64, tokenHash string) error {
	return r.queries.RevokeRefreshToken(ctx, db.RevokeRefreshTokenParams{
		UserID:    userID,
		TokenHash: tokenHash,
	})
}

func (r *UserRepository) GetRefreshToken(ctx context.Context, userID int64, tokenHash string) (*RefreshToken, error) {
	token, err := r.queries.GetRefreshToken(ctx, db.GetRefreshTokenParams{
		UserID:    userID,
		TokenHash: tokenHash,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}
	return &RefreshToken{
		UserID:      token.UserID,
		TokenHash:   token.TokenHash,
		IsRefreshed: token.IsRefreshed,
		CreatedAt:   token.CreatedAt,
		ExpiresAt:   token.ExpiresAt,
		RevokedAt:   token.RevokedAt, // sql.NullTime из модели sqlc
	}, nil
}