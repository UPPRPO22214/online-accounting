package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"microservices/accounter/internal/repository/query"
	"microservices/accounter/internal/usecases"

	"github.com/gin-gonic/gin"
)

type AccountHandler struct {
	accountService *usecases.AccountService
	memberService  *usecases.AccountMemberService
}

func NewAccountHandler(
	accountService *usecases.AccountService,
	memberService *usecases.AccountMemberService,
) *AccountHandler {
	return &AccountHandler{
		accountService: accountService,
		memberService:  memberService,
	}
}

// CreateAccountRequest представляет данные для создания счёта
type CreateAccountRequest struct {
	Name        string  `json:"name" binding:"required" example:"Семейный бюджет"`
	Description *string `json:"description" example:"Общий счёт для домашних расходов"`
}

// AccountResponse представляет информацию о счёте
type AccountResponse struct {
	ID          int32   `json:"id" example:"1"`
	OwnerID     int32   `json:"owner_id" example:"42"`
	Name        string  `json:"name" example:"Семейный бюджет"`
	Description *string `json:"description" example:"Общий счёт для домашних расходов"`
}

// Account модель счёта
type AccountRoleResponse struct {
	ID          int32   `json:"id" example:"1"`
	Name        string  `json:"name" example:"Основной счёт"`
	Description *string `json:"description" example:"Общий счёт для домашних расходов"`
	Role        string  `json:"role" binding:"required,oneof=viewer editor admin" enums:"viewer,editor,admin" example:"editor"`
}

// InviteMemberRequest представляет данные для приглашения участника
type InviteMemberRequest struct {
	Email string `json:"email" binding:"required,email" example:"newmember@example.com"`
	Role  string `json:"role" binding:"required,oneof=viewer editor admin" enums:"viewer,editor,admin" example:"editor"`
}

// MemberResponse модель участника счёта
type MemberResponse struct {
	UserID int32  `json:"user_id" binding:"required,user_id" example:"2"`
	Email  string `json:"email" binding:"required,email" example:"newmember@example.com"`
	Role   string `json:"role" binding:"required,oneof=viewer editor admin" enums:"viewer,editor,admin" example:"editor"`
}

// ChangeRoleRequest представляет данные для изменения роли участника
type ChangeRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=viewer editor admin" enums:"viewer,editor,admin" example:"admin"`
}

// IDResponse представляет ответ с ID созданной сущности
type IDResponse struct {
	ID int `json:"id" example:"1"`
}

// CreateAccount godoc
// @Summary      Создание нового счёта
// @Description  Создаёт новый счёт для управления финансами. Создатель счёта автоматически получает роль Owner и может приглашать других участников, управлять их ролями и удалять счёт. Название счёта должно быть уникальным в рамках пользователя. Описание опционально.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body CreateAccountRequest true "Данные нового счёта. Название обязательно, описание опционально."
// @Success      201 {object} IDResponse "Счёт успешно создан. Возвращается ID нового счёта."
// @Failure      400 {object} ErrorResponse "Неверный формат данных. Проверьте наличие названия счёта."
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при создании счёта"
// @Router       /accounts [post]
func (h *AccountHandler) CreateAccount(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accountID, err := h.accountService.CreateAccount(
		c.Request.Context(),
		userID,
		req.Name,
		req.Description,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": accountID})
}

// GetAccount godoc
// @Summary      Получение информации о счёте
// @Description  Возвращает детальную информацию о счёте по его ID: название, описание, владельца. Доступно всем участникам счёта. Для просмотра счёта пользователь должен быть его участником с любой ролью (Viewer, Editor, Admin, Owner).
// @Tags         accounts
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта" example(1)
// @Success      200 {object} AccountResponse "Информация о счёте успешно получена"
// @Failure      400 {object} ErrorResponse "Неверный формат ID счёта"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Пользователь не является участником данного счёта"
// @Failure      404 {object} ErrorResponse "Счёт с указанным ID не найден"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера"
// @Router       /accounts/{id} [get]
func (h *AccountHandler) GetAccount(c *gin.Context) {
	userID := c.GetInt("user_id")

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	err = h.memberService.IsMember(c.Request.Context(), accountID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	account, err := h.accountService.GetAccountByID(c.Request.Context(), accountID)
	if err != nil {
		if err == usecases.ErrAccountNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, AccountResponse{
		ID:          account.ID,
		OwnerID:     account.OwnerID,
		Name:        account.Name,
		Description: convertNullString(account.Description),
	})
}

// ListUserAccounts godoc
// @Summary      Получение списка счетов пользователя
// @Description  Возвращает все счета, к которым пользователь имеет доступ (включая счета, где пользователь является участником). Список включает как собственные счета (роль Owner), так и счета, к которым пользователь был приглашён (роли Participant, Viewer и т.д.)
// @Tags         accounts
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} AccountRoleResponse "Список счетов пользователя"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при получении счетов"
// @Router       /accounts [get]
func (h *AccountHandler) ListUserAccounts(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	accounts, err := h.accountService.ListForUser(c.Request.Context(), userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	// Преобразуем в DTO
	response := make([]AccountRoleResponse, 0, len(accounts))
	for _, acc := range accounts {
		response = append(response, AccountRoleResponse{
			ID:          acc.ID,
			Name:        acc.Name,
			Description: convertNullString(acc.Description),
			Role:        string(acc.Role),
		})
	}

	c.JSON(http.StatusOK, response)
}

// ListAccountMembers godoc
// @Summary      Получение списка участников счёта
// @Description  Возвращает список пользователей с доступом к счёту и их ролями
// @Tags         accounts
// @Security     BearerAuth
// @Produce      json
// @Param        id path int true "ID счёта" format(int64) example(1)
// @Success      200 {array} MemberResponse "Список участников"
// @Failure      400 {object} ErrorResponse "Неверный ID счёта"
// @Failure      401 {object} ErrorResponse "Требуется аутентификация"
// @Failure      403 {object} ErrorResponse "Недостаточно прав"
// @Failure      404 {object} ErrorResponse "Счёт не найден"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера"
// @Router       /accounts/{id}/members [get]
func (h *AccountHandler) ListAccountMembers(c *gin.Context) {
	userID := c.GetInt("user_id")

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	members, err := h.accountService.ListMembers(
		c.Request.Context(),
		accountID,
		userID,
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	resp := make([]MemberResponse, 0, len(members))
	for _, m := range members {
		resp = append(resp, MemberResponse{
			UserID: m.UserID,
			Email:  m.Email,
			Role:   string(m.Role),
		})
	}

	c.JSON(http.StatusOK, resp)
}

// DeleteAccount godoc
// @Summary      Удаление счёта
// @Description  Полностью удаляет счёт вместе со всеми связанными данными: транзакциями и участниками. Операция необратима. Доступна только владельцу счёта (роль Owner). После удаления все участники теряют доступ к счёту, и все транзакции становятся недоступны.
// @Tags         accounts
// @Security     BearerAuth
// @Param        id path int true "ID счёта для удаления" example(1)
// @Success      204 "Счёт успешно удалён вместе со всеми данными"
// @Failure      400 {object} ErrorResponse "Неверный формат ID счёта"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Удалять счёт может только его владелец (Owner)"
// @Failure      404 {object} ErrorResponse "Счёт с указанным ID не найден"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при удалении счёта"
// @Router       /accounts/{id} [delete]
func (h *AccountHandler) DeleteAccount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	err = h.accountService.DeleteAccount(
		c.Request.Context(),
		accountID,
		userID.(int),
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if err == usecases.ErrAccountNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// InviteMember godoc
// @Summary      Приглашение участника в счёт
// @Description  Добавляет нового участника в счёт с указанной ролью. Доступно только владельцу счёта (Owner). Приглашаемый пользователь должен быть зарегистрирован в системе. Роли: viewer (только просмотр), editor (создание/редактирование своих транзакций), admin (полные права на транзакции).
// @Tags         members
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта" example(1)
// @Param        request body InviteMemberRequest true "Email пользователя и его роль в счёте"
// @Success      201 {object} MessageResponse "Участник успешно добавлен в счёт"
// @Failure      400 {object} ErrorResponse "Неверный формат данных или неподдерживаемая роль"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Приглашать участников может только Owner"
// @Failure      404 {object} ErrorResponse "Пользователь с указанным email не найден в системе"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при добавлении участника"
// @Router       /accounts/{id}/members [post]
func (h *AccountHandler) InviteMember(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	var req InviteMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := parseRole(req.Role)

	err = h.memberService.Invite(
		c.Request.Context(),
		accountID,
		userID.(int),
		req.Email,
		role,
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if err == usecases.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "member invited"})
}

// ChangeRole godoc
// @Summary      Изменение роли участника
// @Description  Изменяет роль существующего участника счёта. Доступно только владельцу счёта (Owner). Нельзя изменить роль самого владельца. Роли: viewer (только просмотр), editor (создание/редактирование своих транзакций), admin (полные права на транзакции). Изменение роли применяется немедленно.
// @Tags         members
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ID счёта" example(1)
// @Param        user_id path int true "ID пользователя, чью роль нужно изменить" example(42)
// @Param        request body ChangeRoleRequest true "Новая роль участника"
// @Success      200 {object} MessageResponse "Роль участника успешно изменена"
// @Failure      400 {object} ErrorResponse "Неверный формат данных или неподдерживаемая роль"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Изменять роли может только Owner"
// @Failure      404 {object} ErrorResponse "Участник не найден в данном счёте"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при изменении роли"
// @Router       /accounts/{id}/members/{user_id} [patch]
func (h *AccountHandler) ChangeRole(c *gin.Context) {
	ownerID := c.GetInt("user_id")

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	memberUserID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req ChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := parseRole(req.Role)

	err = h.memberService.ChangeRole(
		c.Request.Context(),
		accountID,
		ownerID,
		memberUserID,
		role,
	)
	if err != nil {
		if err == usecases.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "role changed"})
}

// RemoveMember godoc
// @Summary      Удаление участника из счёта
// @Description  Удаляет участника из счёта, лишая его доступа ко всем данным счёта. Доступно только владельцу счёта (Owner). Нельзя удалить самого владельца. После удаления участник теряет доступ к просмотру и редактированию транзакций. Созданные им транзакции остаются в счёте.
// @Tags         members
// @Security     BearerAuth
// @Param        id path int true "ID счёта" example(1)
// @Param        user_id path int true "ID пользователя для удаления из счёта" example(42)
// @Success      204 "Участник успешно удалён из счёта"
// @Failure      400 {object} ErrorResponse "Неверный формат ID счёта или пользователя"
// @Failure      401 {object} ErrorResponse "Отсутствует или невалидный JWT токен"
// @Failure      403 {object} ErrorResponse "Недостаточно прав. Удалять участников может только Owner"
// @Failure      404 {object} ErrorResponse "Участник не найден в данном счёте"
// @Failure      500 {object} ErrorResponse "Внутренняя ошибка сервера при удалении участника"
// @Router       /accounts/{id}/members/{user_id} [delete]
func (h *AccountHandler) RemoveMember(c *gin.Context) {
	ownerID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	memberUserID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	err = h.memberService.Remove(
		c.Request.Context(),
		accountID,
		ownerID.(int),
		memberUserID,
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

func parseRole(role string) query.AccountMembersRole {
	switch role {
	case "viewer":
		return query.AccountMembersRoleViewer
	case "editor":
		return query.AccountMembersRoleEditor
	case "admin":
		return query.AccountMembersRoleAdmin
	default:
		return query.AccountMembersRoleViewer
	}
}

func convertNullString(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	return &ns.String
}
