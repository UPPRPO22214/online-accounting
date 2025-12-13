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

type CreateAccountRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description"`
}

type AccountResponse struct {
	ID          int32   `json:"id"`
	OwnerID     int32   `json:"owner_id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type InviteMemberRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required,oneof=viewer editor admin"`
}

type ChangeRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=viewer editor admin"`
}

// POST /accounts
func (h *AccountHandler) CreateAccount(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accountID, err := h.accountService.CreateAccount(
		c.Request.Context(),
		userID.(int),
		req.Name,
		req.Description,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": accountID})
}

// GET /accounts/:id
func (h *AccountHandler) GetAccount(c *gin.Context) {
	accountID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
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

// DELETE /accounts/:id
func (h *AccountHandler) DeleteAccount(c *gin.Context) {
	userID, _ := c.Get("user_id")

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

// POST /accounts/:id/members
func (h *AccountHandler) InviteMember(c *gin.Context) {
	userID, _ := c.Get("user_id")

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

// PATCH /accounts/:id/members/:user_id
func (h *AccountHandler) ChangeRole(c *gin.Context) {
	ownerID, _ := c.Get("user_id")

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
		ownerID.(int),
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

// DELETE /accounts/:id/members/:user_id
func (h *AccountHandler) RemoveMember(c *gin.Context) {
	ownerID, _ := c.Get("user_id")

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
