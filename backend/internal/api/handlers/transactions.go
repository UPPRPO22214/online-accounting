package handlers

import (
	"net/http"
	"strconv"
	"time"

	"microservices/accounter/internal/models"
	"microservices/accounter/internal/usecases"

	"github.com/gin-gonic/gin"
)

type TransactionHandler struct {
	service *usecases.TransactionService
}

func NewTransactionHandler(service *usecases.TransactionService) *TransactionHandler {
	return &TransactionHandler{service: service}
}

type CreateTransactionRequest struct {
	Title      string  `json:"title" binding:"required"`
	Amount     string  `json:"amount" binding:"required"`
	OccurredAt *string `json:"occurred_at"`
	Category   *string `json:"category"`
	IsPeriodic bool    `json:"is_periodic"`
}

type TransactionResponse struct {
	ID         int32     `json:"id"`
	AccountID  int32     `json:"account_id"`
	UserID     int32     `json:"user_id"`
	Title      string    `json:"title"`
	Amount     string    `json:"amount"`
	OccurredAt time.Time `json:"occurred_at"`
	Category   *string   `json:"category"`
	IsPeriodic bool      `json:"is_periodic"`
}

// POST /accounts/:id/transactions
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	occurredAt := time.Now()
	if req.OccurredAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.OccurredAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid occurred_at format"})
			return
		}
		occurredAt = parsed
	}

	transactionID, err := h.service.Create(
		c.Request.Context(),
		accountID,
		userID.(int),
		req.Title,
		req.Amount,
		occurredAt,
		req.Category,
		req.IsPeriodic,
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": transactionID})
}

// GET /accounts/:id/transactions
func (h *TransactionHandler) ListTransactions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	filter := &models.ListTransactionsFilter{
		AccountID: accountID,
	}

	// date_from
	if dateFromStr := c.Query("date_from"); dateFromStr != "" {
		parsed, err := time.Parse(time.RFC3339, dateFromStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_from format"})
			return
		}
		filter.DateFrom = &parsed
	}

	// date_to
	if dateToStr := c.Query("date_to"); dateToStr != "" {
		parsed, err := time.Parse(time.RFC3339, dateToStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_to format"})
			return
		}
		filter.DateTo = &parsed
	}

	// is_periodic
	if isPeriodicStr := c.Query("is_periodic"); isPeriodicStr != "" {
		isPeriodic := isPeriodicStr == "true"
		filter.IsPeriodic = &isPeriodic
	}

	// type (income/expense)
	if typeStr := c.Query("type"); typeStr != "" {
		if typeStr != "income" && typeStr != "expense" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "type must be 'income' or 'expense'"})
			return
		}
		filter.Type = &typeStr
	}

	// categories
	if categoriesStr := c.Query("categories"); categoriesStr != "" {
		filter.Categories = c.QueryArray("categories")
	}

	transactions, err := h.service.List(
		c.Request.Context(),
		accountID,
		userID.(int),
		filter,
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	response := make([]TransactionResponse, len(transactions))
	for i, t := range transactions {
		var category *string
		if t.Category.Valid {
			category = &t.Category.String
		}

		response[i] = TransactionResponse{
			ID:         t.ID,
			AccountID:  t.AccountID,
			UserID:     t.UserID,
			Title:      t.Title,
			Amount:     t.Amount,
			OccurredAt: t.OccurredAt,
			Category:   category,
			IsPeriodic: t.IsPeriodic,
		}
	}

	c.JSON(http.StatusOK, response)
}

// DELETE /transactions/:id
func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")

	transactionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction id"})
		return
	}

	// Нужно получить accountID и ownerID транзакции для проверки прав
	// Предполагаю, что эти данные передаются в query params или
	// нужно добавить метод в service для получения транзакции
	accountIDStr := c.Query("account_id")
	ownerIDStr := c.Query("owner_id")

	if accountIDStr == "" || ownerIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "account_id and owner_id required"})
		return
	}

	accountID, _ := strconv.Atoi(accountIDStr)
	transactionOwnerID, _ := strconv.Atoi(ownerIDStr)

	err = h.service.Delete(
		c.Request.Context(),
		accountID,
		userID.(int),
		transactionOwnerID,
		transactionID,
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
