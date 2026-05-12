package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/delivery/http/middleware"
	"github.com/wikiora/wikiora/apps/api/internal/dto"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

type InviteHandler struct {
	invites *service.InviteService
}

func NewInviteHandler(invites *service.InviteService) *InviteHandler {
	return &InviteHandler{invites: invites}
}

func (h *InviteHandler) Create(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	var body struct {
		Email string `json:"email" binding:"required,email"`
		Role  string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	invite, err := h.invites.Create(c.Request.Context(), clerkUserID, workspaceID, body.Email, body.Role)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invite_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, dto.NewWorkspaceInviteResponse(*invite, true))
}

func (h *InviteHandler) ListForWorkspace(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	invites, err := h.invites.ListForWorkspace(c.Request.Context(), clerkUserID, workspaceID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invite_list_failed", "message": err.Error()}})
		return
	}

	response := make([]dto.WorkspaceInviteResponse, 0, len(invites))
	for _, invite := range invites {
		response = append(response, dto.NewWorkspaceInviteResponse(invite, false))
	}
	c.JSON(http.StatusOK, response)
}

func (h *InviteHandler) Revoke(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	inviteID, err := uuid.Parse(c.Param("inviteId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid invite id"}})
		return
	}

	err = h.invites.Revoke(c.Request.Context(), clerkUserID, workspaceID, inviteID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrInviteNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "invite not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "revoke_failed", "message": err.Error()}})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *InviteHandler) Resend(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	inviteID, err := uuid.Parse(c.Param("inviteId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid invite id"}})
		return
	}

	invite, err := h.invites.Resend(c.Request.Context(), clerkUserID, workspaceID, inviteID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrInviteNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "invite not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "resend_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.NewWorkspaceInviteResponse(*invite, true))
}

func (h *InviteHandler) ListMine(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	invites, err := h.invites.ListForCurrentUser(c.Request.Context(), clerkUserID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to list invites"}})
		return
	}

	response := make([]dto.PendingInviteResponse, 0, len(invites))
	for _, invite := range invites {
		response = append(response, dto.NewPendingInviteResponse(invite))
	}
	c.JSON(http.StatusOK, response)
}

func (h *InviteHandler) Accept(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	var body struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	workspace, err := h.invites.Accept(c.Request.Context(), clerkUserID, body.Token)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrInviteNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "invite not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "accept_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.NewWorkspaceResponse(*workspace))
}
