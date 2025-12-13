package usecases

import (
	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/tokens"
)

type Service struct {
	AuthScv        *AuthService
	AccountScv     *AccountService
	AccountMember  *AccountMemberService
	TransactionScv *TransactionService
}

func New(repo *repository.Repository, tokens *tokens.JWTManager) *Service {
	return &Service{
		AuthScv:        newAuthService(repo, tokens),
		AccountScv:     newAccountService(repo),
		AccountMember: newAccountMemberService(repo),
		TransactionScv: newTransactionService(repo),
	}
}
