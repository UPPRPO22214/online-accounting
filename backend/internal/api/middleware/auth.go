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
		// Проверяем заголовок
		authHeader := c.GetHeader("Authorization")
		var token string

		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token = parts[1]
			}
		}

		// Если есть и заголовок и кука - проверяем, что они совпадают
		if cookieToken, err := c.Cookie("access_token"); err == nil {
			if token != "" && token != cookieToken {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token mismatch"})
				c.Abort()
				return
			}
			// Используем куку, если заголовка нет
			if token == "" {
				token = cookieToken
			}
		}

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
