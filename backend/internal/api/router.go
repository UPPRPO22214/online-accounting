package api

import (
	"microservices/accounter/internal/api/handlers"
	"microservices/accounter/internal/api/middleware"
	"microservices/accounter/internal/tokens"
	"microservices/accounter/internal/usecases"

	"github.com/gin-gonic/gin"
)

func SetupRouter(services *usecases.Service, jwtManager *tokens.JWTManager) *gin.Engine {
	router := gin.Default()

	// Handlers
	authHandler := handlers.NewAuthHandler(services.AuthScv)
	accountHandler := handlers.NewAccountHandler(services.AccountScv, services.AccountMember)
	transactionHandler := handlers.NewTransactionHandler(services.TransactionScv)

	// Public routes
	auth := router.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes
	authMiddleware := middleware.AuthMiddleware(jwtManager)

	router.POST("/auth/change-password", authMiddleware, authHandler.ChangePassword)

	// Accounts
	accounts := router.Group("/accounts", authMiddleware)
	{
		accounts.POST("", accountHandler.CreateAccount)
		accounts.GET("/:id", accountHandler.GetAccount)
		accounts.DELETE("/:id", accountHandler.DeleteAccount)

		// Members
		accounts.POST("/:id/members", accountHandler.InviteMember)
		accounts.PATCH("/:id/members/:user_id", accountHandler.ChangeRole)
		accounts.DELETE("/:id/members/:user_id", accountHandler.RemoveMember)

		// Transactions
		accounts.POST("/:id/transactions", transactionHandler.CreateTransaction)
		accounts.GET("/:id/transactions", transactionHandler.ListTransactions)
	}

	// Transactions
	router.DELETE("/transactions/:id", authMiddleware, transactionHandler.DeleteTransaction)

	return router
}
