package repository

import (
	"microservices/accounter/internal/repository/query"
)

type Repository struct {
	UserRepo          *UserRepository
	AccountRepo       *AccountRepository
	AccountMemberRepo *AccountMemberRepository
	TransactionRepo   *TransactionRepository
}

func New(db query.DBTX) *Repository {
	return &Repository{
		UserRepo:          newUserRepository(db),
		AccountRepo:       newAccountRepository(db),
		AccountMemberRepo: newAccountMemberRepository(db),
		TransactionRepo:   newTransactionRepository(db),
	}
}
