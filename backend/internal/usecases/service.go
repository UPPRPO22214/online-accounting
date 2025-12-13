package usecases

import (
	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/tokens"
)

type Service struct {
	AuthScv *AuthService
}

func New(repo *repository.Repository, tokens *tokens.JWTManager) *Service {
	return &Service{
		AuthScv: newAuthService(repo.UserRepo, tokens),
	}
}
