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

// CreateTransactionRequest представляет данные для создания транзакции
type CreateTransactionRequest struct {
	Title      string  `json:"title" binding:"required" example:"Покупка продуктов"`
	Amount     string  `json:"amount" binding:"required" example:"-1500.50"`
	OccurredAt *string `json:"occurred_at" example:"2024-12-13T14:30:00Z"`
	Category   *string `json:"category" example:"Еда"`
	IsPeriodic bool    `json:"is_periodic" example:"false"`
}

// TransactionResponse представляет информацию о транзакции
type TransactionResponse struct {
	ID         int32     `json:"id" example:"123"`
	AccountID  int32     `json:"account_id" example:"1"`
	UserID     int32     `json:"user_id" example:"42"`
	Title      string    `json:"title" example:"Покупка продуктов"`
	Amount     string    `json:"amount" example:"-1500.50"`
	OccurredAt time.Time `json:"occurred_at" example:"2024-12-13T14:30:00Z"`
	Category   *string   `json:"category" example:"Еда"`
	IsPeriodic bool      `json:"is_periodic" example:"false"`
}

// CreateTransaction godoc
// @Summary      Создание транзакции
// @Description  Создаёт новую финансовую транзакцию в счёте. Доступно участникам с ролью Editor и выше. Amount: положительное число для дохода, отрицательное для расхода. Поле occurred_at опционально (по умолчанию текущее время). Category опционально. IsPeriodic для периодических платежей (зарплата, аренда и т.д.).
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта, в котором создаётся транзакция" example(1)
// @Param        request body CreateTransactionRequest true "Данные транзакции. Title обязательно, amount в формате строки с точкой как разделителем"
// @Success      201 {object} IDResponse "Транзакция успешно создана. Возвращается ID новой транзакции"
// @Failure      400 {object} ErrorResponse "Неверный формат данных. Проверьте формат amount и occurred_at (RFC3339)"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Создавать транзакции могут только Editor, Admin и Owner"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при создании транзакции"
// @Router       /accounts/{id}/transactions [post]
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

// ListTransactions godoc
// @Summary      Список транзакций с фильтрацией
// @Description  Возвращает список транзакций счёта с возможностью фильтрации. Доступно всем участникам счёта (включая Viewer). Фильтры: date_from/date_to (временной диапазон в RFC3339), type (income/expense для доходов/расходов), is_periodic (только периодические), categories (массив категорий). Все фильтры опциональны и могут комбинироваться.
// @Tags         transactions
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта" example(1)
// @Param        date_from query string false "Начальная дата (RFC3339). Включает транзакции с этой даты и позже" example(2024-12-01T00:00:00Z)
// @Param        date_to query string false "Конечная дата (RFC3339). Включает транзакции до этой даты включительно" example(2024-12-31T23:59:59Z)
// @Param        is_periodic query boolean false "Фильтр по периодическим транзакциям. true - только периодические, false - только разовые"
// @Param        type query string false "Фильтр по типу транзакции" Enums(income, expense)
// @Param        categories query []string false "Массив категорий для фильтрации. Можно указать несколько через &categories=Еда&categories=Транспорт" collectionFormat(multi)
// @Success      200 {array} TransactionResponse "Список транзакций, соответствующих фильтрам. Пустой массив если транзакций нет"
// @Failure      400 {object} ErrorResponse "Неверные параметры фильтрации. Проверьте формат дат и значение type"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Пользователь не является участником данного счёта"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при получении транзакций"
// @Router       /accounts/{id}/transactions [get]
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

// DeleteTransaction godoc
// @Summary      Удаление транзакции
// @Description  Удаляет транзакцию из счёта. Права доступа: Editor может удалять только свои транзакции (созданные им), Admin и Owner могут удалять любые транзакции. Viewer не может удалять транзакции. Операция необратима. Транзакция автоматически получается по ID для проверки прав доступа.
// @Tags         transactions
// @Security     BearerAuth
// @Param        id path int true "ID транзакции для удаления" example(123)
// @Success      204 "Транзакция успешно удалена"
// @Failure      400 {object} ErrorResponse "Неверный формат ID транзакции"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Editor может удалять только свои транзакции, Admin/Owner - любые"
// @Failure      404 {object} ErrorResponse "Транзакция с указанным ID не найдена"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при удалении транзакции"
// @Router       /transactions/{id} [delete]
func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")

	transactionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction id"})
		return
	}

	// Получаем транзакцию для проверки прав
	transaction, err := h.service.GetByID(c.Request.Context(), int32(transactionID))
	if err != nil {
		if err == usecases.ErrTransactionNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	err = h.service.Delete(
		c.Request.Context(),
		int(transaction.AccountID),
		userID.(int),
		int(transaction.UserID),
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
