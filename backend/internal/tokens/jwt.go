package tokens

import (
	"time"

	"microservices/accounter/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	secret []byte
	ttl    time.Duration
}

func NewJWTManager(cfg config.JWT) *JWTManager {
	return &JWTManager{
		secret: []byte(cfg.Secret),
		ttl:    cfg.ExpiresMinutes * time.Minute,
	}
}

func (m *JWTManager) Generate(userID int) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(m.ttl).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

func (m *JWTManager) Parse(tokenStr string) (int, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		return m.secret, nil
	})
	if err != nil || !token.Valid {
		return 0, err
	}

	claims := token.Claims.(jwt.MapClaims)
	return int(claims["sub"].(float64)), nil
}
