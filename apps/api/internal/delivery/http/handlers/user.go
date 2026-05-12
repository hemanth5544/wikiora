package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wikiora/wikiora/apps/api/internal/delivery/http/middleware"
	"github.com/wikiora/wikiora/apps/api/internal/dto"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

type UserHandler struct {
	users *service.UserService
}

func NewUserHandler(users *service.UserService) *UserHandler {
	return &UserHandler{users: users}
}

func (h *UserHandler) Me(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	user, err := h.users.GetByClerkID(c.Request.Context(), clerkUserID)
	if errors.Is(err, repository.ErrUserNotFound) {
		user, err = h.users.EnsureFromClerkAPI(c.Request.Context(), clerkUserID)
	}
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "user_not_synced",
				"message": "user has not been synced yet",
			},
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "internal_error",
				"message": "failed to load user",
			},
		})
		return
	}

	c.JSON(http.StatusOK, dto.NewUserResponse(user))
}


func (h *UserHandler) Sync(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	var body struct {
		Email     string `json:"email" binding:"required,email"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		AvatarURL string `json:"avatarUrl"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "invalid_request",
				"message": err.Error(),
			},
		})
		return
	}

	user, err := h.users.SyncFromClerk(c.Request.Context(), service.ClerkUserPayload{
		ClerkUserID: clerkUserID,
		Email:       body.Email,
		FirstName:   body.FirstName,
		LastName:    body.LastName,
		AvatarURL:   body.AvatarURL,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "sync_failed",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, dto.NewUserResponse(user))
}
