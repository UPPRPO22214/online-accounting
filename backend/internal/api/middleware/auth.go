package middleware

import (
	"net/http"
	"strings"

	"microservices/accounter/internal/tokens"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware проверяет JWT токен и кладёт user_id в context
func AuthMiddleware(jwtManager *tokens.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		// Формат: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

		token := parts[1]

		userID, err := jwtManager.Parse(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// Кладём user_id в context
		c.Set("user_id", userID)
		c.Next()
	}
}
