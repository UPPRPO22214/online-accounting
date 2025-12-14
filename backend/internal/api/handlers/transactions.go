package handlers

import (
	"net/http"
	"strconv"
	"time"

	"microservices/accounter/internal/repository/query"
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
	Period     *string `json:"period" enums:"day,week,month,year" example:"week"`
}

// UpdateTransactionRequest представляет данные для обновления транзакции
type UpdateTransactionRequest struct {
	Title      string  `json:"title" binding:"required" example:"Обновленное название"`
	Amount     string  `json:"amount" binding:"required" example:"-2000.00"`
	OccurredAt *string `json:"occurred_at" binding:"required" example:"2024-12-20T15:00:00Z"`
}

// TransactionResponse представляет информацию о транзакции
type TransactionResponse struct {
	ID         int32     `json:"id" example:"123"`
	AccountID  int32     `json:"account_id" example:"1"`
	UserID     int32     `json:"user_id" example:"42"`
	Title      string    `json:"title" example:"Покупка продуктов"`
	Amount     string    `json:"amount" example:"-1500.50"`
	OccurredAt time.Time `json:"occurred_at" example:"2024-12-13T14:30:00Z"`
	Period     *string   `json:"period" example:"week"`
}

// CreateTransaction godoc
// @Summary      Создание транзакции (обычной или периодической)
// @Description  Создаёт финансовую транзакцию в счёте. Доступно участникам с ролью Editor и выше. Amount: положительное число для дохода, отрицательное для расхода. Если указан период (day/week/month/year), автоматически создаётся 500 периодических записей с указанным интервалом. Например, period="week" создаст транзакции с интервалом в 7 дней на ~9.6 лет вперёд. Это удобно для регулярных платежей: зарплата, аренда, подписки.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта, в котором создаётся транзакция" example(1)
// @Param        request body CreateTransactionRequest true "Данные транзакции. Title и amount обязательны. occurred_at опционален (по умолчанию текущее время). period опционален (day/week/month/year для периодических платежей)"
// @Success      201 {object} IDResponse "Транзакция успешно создана. Для периодической транзакции создаётся 500 записей"
// @Failure      400 {object} ErrorResponse "Неверный формат данных. Проверьте формат amount, occurred_at (RFC3339) и period (day/week/month/year)"
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

	// Парсинг даты
	occurredAt := time.Now()
	if req.OccurredAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.OccurredAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid occurred_at format, use RFC3339"})
			return
		}
		occurredAt = parsed
	}

	// Парсинг периода
	var period query.NullTransactionsPeriod
	if req.Period != nil && *req.Period != "" {
		periodValue, err := parsePeriod(*req.Period)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		period = query.NullTransactionsPeriod{
			TransactionsPeriod: periodValue,
			Valid:              true,
		}
	}

	transactionID, err := h.service.Create(
		c.Request.Context(),
		accountID,
		userID.(int),
		req.Title,
		req.Amount,
		occurredAt,
		period,
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
// @Description  Возвращает список транзакций счёта с возможностью фильтрации. Доступно всем участникам счёта (включая Viewer). Фильтры: date_from/date_to (временной диапазон в RFC3339), type (income/expense для доходов/расходов), user_id (транзакции конкретного пользователя). Все фильтры опциональны и могут комбинироваться. Возвращаются все транзакции (включая периодические), соответствующие фильтрам, отсортированные по дате (новые первыми).
// @Tags         transactions
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта" example(1)
// @Param        date_from query string false "Начальная дата (RFC3339). Включает транзакции с этой даты и позже" example(2024-12-01T00:00:00Z)
// @Param        date_to query string false "Конечная дата (RFC3339). Включает транзакции до этой даты включительно" example(2024-12-31T23:59:59Z)
// @Param        type query string false "Фильтр по типу транзакции" Enums(income, expense)
// @Param        user_id query int false "Фильтр по ID пользователя (создателя транзакции)" example(42)
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_from format, use RFC3339"})
			return
		}
		filter.DateFrom = &parsed
	}

	// date_to
	if dateToStr := c.Query("date_to"); dateToStr != "" {
		parsed, err := time.Parse(time.RFC3339, dateToStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_to format, use RFC3339"})
			return
		}
		filter.DateTo = &parsed
	}

	// type (income/expense)
	if typeStr := c.Query("type"); typeStr != "" {
		if typeStr != "income" && typeStr != "expense" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "type must be 'income' or 'expense'"})
			return
		}
		filter.Type = &typeStr
	}

	// user_id (фильтр по создателю транзакции)
	if userIDStr := c.Query("user_id"); userIDStr != "" {
		filterUserID, err := strconv.Atoi(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id format"})
			return
		}
		filter.UserID = &filterUserID
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
		var period *string
		if t.Period.Valid {
			periodStr := string(t.Period.TransactionsPeriod)
			period = &periodStr
		}

		response[i] = TransactionResponse{
			ID:         t.ID,
			AccountID:  t.AccountID,
			UserID:     t.UserID,
			Title:      t.Title,
			Amount:     t.Amount,
			OccurredAt: t.OccurredAt,
			Period:     period,
		}
	}

	c.JSON(http.StatusOK, response)
}

// UpdateTransaction godoc
// @Summary      Обновление транзакции
// @Description  Обновляет поля транзакции: title, amount, occurred_at. Поле period обновить нельзя. Права доступа: Editor может редактировать только свои транзакции (созданные им), Admin и Owner могут редактировать любые транзакции. Viewer не может редактировать транзакции. При обновлении периодической транзакции изменяется только одна запись, а не вся серия.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID транзакции для обновления" example(123)
// @Param        request body UpdateTransactionRequest true "Новые данные транзакции. Все поля обязательны."
// @Success      200 {object} MessageResponse "Транзакция успешно обновлена"
// @Failure      400 {object} ErrorResponse "Неверный формат данных или ID транзакции"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Editor может редактировать только свои транзакции, Admin/Owner - любые"
// @Failure      404 {object} ErrorResponse "Транзакция с указанным ID не найдена"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при обновлении транзакции"
// @Router       /transactions/{id} [patch]
func (h *TransactionHandler) UpdateTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")

	transactionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction id"})
		return
	}

	var req UpdateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Парсинг даты
	var occurredAt time.Time
	if req.OccurredAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.OccurredAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid occurred_at format, use RFC3339"})
			return
		}
		occurredAt = parsed
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "occurred_at is required"})
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

	// Обновляем транзакцию
	err = h.service.Update(
		c.Request.Context(),
		int32(transactionID),
		int(transaction.AccountID),
		userID.(int),
		int(transaction.UserID),
		&models.UpdateTransactionParams{
			Title:      req.Title,
			Amount:     req.Amount,
			OccurredAt: occurredAt,
		},
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "transaction updated successfully"})
}

// DeleteTransaction godoc
// @Summary      Удаление транзакции
// @Description  Удаляет транзакцию из счёта. Права доступа: Editor может удалять только свои транзакции (созданные им), Admin и Owner могут удалять любые транзакции. Viewer не может удалять транзакции. Операция необратима. Транзакция автоматически получается по ID для проверки прав доступа. ВАЖНО: при удалении периодической транзакции удаляется только одна запись, а не вся серия.
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

// parsePeriod конвертирует строку в TransactionsPeriod с валидацией
func parsePeriod(period string) (query.TransactionsPeriod, error) {
	switch period {
	case "day":
		return query.TransactionsPeriodDay, nil
	case "week":
		return query.TransactionsPeriodWeek, nil
	case "month":
		return query.TransactionsPeriodMonth, nil
	case "year":
		return query.TransactionsPeriodYear, nil
	default:
		return "", gin.Error{
			Err:  nil,
			Type: gin.ErrorTypeBind,
			Meta: "period must be one of: day, week, month, year",
		}
	}
}
