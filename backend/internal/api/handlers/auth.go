package handlers

import (
	"net/http"

	"microservices/accounter/internal/usecases"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *usecases.AuthService
}

func NewAuthHandler(service *usecases.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// RegisterRequest представляет данные для регистрации пользователя
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required,min=6" example:"securePassword123"`
}

// LoginRequest представляет данные для входа в систему
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"securePassword123"`
}

// ChangePasswordRequest представляет данные для смены пароля
type ChangePasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=6" example:"newSecurePassword456"`
}

// TokenResponse представляет ответ с JWT токеном
type TokenResponse struct {
	AccessToken string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MDI1MDAwMDB9.abcdef123456"`
}

// ErrorResponse представляет стандартный ответ с ошибкой
type ErrorResponse struct {
	Error string `json:"error" example:"invalid credentials"`
}

// MessageResponse представляет ответ с сообщением об успехе
type MessageResponse struct {
	Message string `json:"message" example:"password changed successfully"`
}

// Register godoc
// @Summary      Регистрация нового пользователя
// @Description  Создаёт нового пользователя с указанным email и паролем. Email должен быть уникальным. Пароль должен содержать минимум 6 символов. После успешной регистрации возвращается JWT токен для авторизации.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body RegisterRequest true "Данные для регистрации. Email должен быть валидным, пароль минимум 6 символов."
// @Success      201 {object} TokenResponse "Пользователь успешно зарегистрирован. Возвращается JWT токен."
// @Failure      400 {object} ErrorResponse "Неверный формат данных. Проверьте email и длину пароля."
// @Failure      409 {object} ErrorResponse "Пользователь с таким email уже существует"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при создании пользователя"
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := h.service.Register(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if err == usecases.ErrUserAlreadyExists {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	// Устанавливаем токен в куки
	c.SetCookie(
		"access_token",           // имя куки
		token,                    // значение
		1800,                     // время жизни в секундах (полчаса)
		"/",                      // путь
		"",                       // домен (пусто = текущий домен)
		false,                    // secure (только HTTPS)
		true,                     // httpOnly (недоступно из JS)
	)

	c.JSON(http.StatusCreated, TokenResponse{AccessToken: token})
}

// Login godoc
// @Summary      Авторизация пользователя
// @Description  Выполняет вход в систему по email и паролю. При успешной авторизации возвращается JWT токен, который необходимо использовать в заголовке Authorization для доступа к защищённым эндпоинтам. Формат: "Bearer <token>". Срок действия токена настраивается через переменную окружения JWT_EXPIRES_IN (по умолчанию 24 часа).
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body LoginRequest true "Учётные данные пользователя. Email и пароль должны совпадать с данными при регистрации."
// @Success      200 {object} TokenResponse "Успешная авторизация. Возвращается JWT токен для последующих запросов."
// @Failure      400 {object} ErrorResponse "Неверный формат данных в запросе"
// @Failure      401 {object} ErrorResponse "Неверный email или пароль"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при авторизации"
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := h.service.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if err == usecases.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	// Устанавливаем токен в куки
	c.SetCookie(
		"access_token",           // имя куки
		token,                    // значение
		1800,                     // время жизни в секундах (полчаса)
		"/",                      // путь
		"",                       // домен (пусто = текущий домен)
		false,                    // secure (только HTTPS)
		true,                     // httpOnly (недоступно из JS)
	)

	c.JSON(http.StatusOK, TokenResponse{AccessToken: token})
}

// ChangePassword godoc
// @Summary      Смена пароля текущего пользователя
// @Description  Изменяет пароль для авторизованного пользователя. Требуется валидный JWT токен в заголовке Authorization. Новый пароль должен содержать минимум 6 символов. Старый токен остаётся валидным до истечения срока действия, рекомендуется получить новый токен после смены пароля.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body ChangePasswordRequest true "Новый пароль. Минимум 6 символов, рекомендуется использовать буквы, цифры и специальные символы."
// @Success      200 {object} MessageResponse "Пароль успешно изменён. Рекомендуется выполнить повторный вход."
// @Failure      400 {object} ErrorResponse "Неверный формат данных. Проверьте длину нового пароля."
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен в заголовке Authorization"
// @Failure      404 {object} ErrorResponse "Пользователь не найден (возможно был удалён)"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при обновлении пароля"
// @Router       /auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.ChangePassword(c.Request.Context(), userID.(int), req.NewPassword)
	if err != nil {
		if err == usecases.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password changed successfully"})
}