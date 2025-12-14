package api

import (
	"microservices/accounter/internal/api/handlers"
	"microservices/accounter/internal/api/middleware"
	"microservices/accounter/internal/tokens"
	"microservices/accounter/internal/usecases"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(services *usecases.Service, jwtManager *tokens.JWTManager) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods: []string{"POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization", "Accept", "User-Agent", "Cache-Control", "Pragma"},
		ExposeHeaders: []string{"Content-Length"},
	}))

	url := ginSwagger.URL("http://localhost:8080/swagger/doc.json")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

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
