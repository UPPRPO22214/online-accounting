package handlers

import (
	"context"
	"microservices/accounter/internal/database"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	db *database.Database
}

func NewHealthHandler(db *database.Database) *HealthHandler {
	return &HealthHandler{db: db}
}

// HealthResponse представляет ответ healthcheck
type HealthResponse struct {
	Status   string            `json:"status" binding:"required" example:"ok"`
	Services map[string]string `json:"services" binding:"required"`
}

// Health godoc
// @Summary      Проверка состояния сервиса
// @Description  Возвращает статус сервиса и его зависимостей (база данных). Используется для healthcheck в Docker и Kubernetes. Статус "ok" означает что все компоненты работают нормально, "degraded" - частичные проблемы, "unavailable" - сервис недоступен.
// @Tags         health
// @Produce      json
// @Success      200 {object} HealthResponse "Сервис работает нормально, все зависимости доступны"
// @Failure      503 {object} HealthResponse "Сервис недоступен или имеются проблемы с зависимостями"
// @Router       /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	response := HealthResponse{
		Status:   "ok",
		Services: make(map[string]string),
	}

	if err := h.db.HealthCheck(ctx); err != nil {
		response.Status = "degraded"
		response.Services["database"] = "unavailable"
		c.JSON(http.StatusServiceUnavailable, response)
		return
	}

	response.Services["database"] = "ok"

	c.JSON(http.StatusOK, response)
}
