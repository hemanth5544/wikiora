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

type WorkspaceHandler struct {
	workspaces *service.WorkspaceService
}

func NewWorkspaceHandler(workspaces *service.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{workspaces: workspaces}
}

func (h *WorkspaceHandler) Create(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	var body struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Visibility  string `json:"visibility"`
		LogoURL     string `json:"logoUrl"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	item, err := h.workspaces.Create(c.Request.Context(), clerkUserID, service.CreateWorkspaceInput{
		Name:        body.Name,
		Description: body.Description,
		Visibility:  body.Visibility,
		LogoURL:     body.LogoURL,
	})
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "create_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, dto.NewWorkspaceResponse(*item))
}

func (h *WorkspaceHandler) List(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	items, err := h.workspaces.List(c.Request.Context(), clerkUserID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to list workspaces"}})
		return
	}

	response := make([]dto.WorkspaceResponse, 0, len(items))
	for _, item := range items {
		response = append(response, dto.NewWorkspaceResponse(item))
	}
	c.JSON(http.StatusOK, response)
}

func (h *WorkspaceHandler) Get(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	item, err := h.workspaces.Get(c.Request.Context(), clerkUserID, workspaceID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to load workspace"}})
		return
	}

	c.JSON(http.StatusOK, dto.NewWorkspaceResponse(*item))
}

func (h *WorkspaceHandler) Update(c *gin.Context) {
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
		Name        *string `json:"name"`
		Description *string `json:"description"`
		Visibility  *string `json:"visibility"`
		LogoURL     *string `json:"logoUrl"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	item, err := h.workspaces.Update(c.Request.Context(), clerkUserID, workspaceID, service.UpdateWorkspaceInput{
		Name:        body.Name,
		Description: body.Description,
		Visibility:  body.Visibility,
		LogoURL:     body.LogoURL,
	})
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "update_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.NewWorkspaceResponse(*item))
}

func (h *WorkspaceHandler) ListMembers(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	members, err := h.workspaces.ListMembers(c.Request.Context(), clerkUserID, workspaceID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to list members"}})
		return
	}

	response := make([]dto.WorkspaceMemberResponse, 0, len(members))
	for _, member := range members {
		response = append(response, dto.NewWorkspaceMemberResponse(member))
	}
	c.JSON(http.StatusOK, response)
}

func (h *WorkspaceHandler) UpdateMemberRole(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	targetUserID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid user id"}})
		return
	}

	var body struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	err = h.workspaces.UpdateMemberRole(c.Request.Context(), clerkUserID, workspaceID, targetUserID, body.Role)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "member not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "update_failed", "message": err.Error()}})
		return
	}

	c.Status(http.StatusNoContent)
}
