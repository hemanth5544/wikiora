package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/delivery/http/middleware"
	"github.com/wikiora/wikiora/apps/api/internal/dto"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

type QueryHandler struct {
	queries *service.QueryService
}

func NewQueryHandler(queries *service.QueryService) *QueryHandler {
	return &QueryHandler{queries: queries}
}

func (h *QueryHandler) ListFeed(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	queries, err := h.queries.ListFeed(c.Request.Context(), clerkUserID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to list queries"}})
		return
	}

	response := make([]dto.QueryResponse, 0, len(queries))
	for _, query := range queries {
		response = append(response, dto.NewQueryResponse(query))
	}
	c.JSON(http.StatusOK, response)
}

func (h *QueryHandler) List(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	queries, err := h.queries.List(c.Request.Context(), clerkUserID, workspaceID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to list queries"}})
		return
	}

	response := make([]dto.QueryResponse, 0, len(queries))
	for _, query := range queries {
		response = append(response, dto.NewQueryResponse(query))
	}
	c.JSON(http.StatusOK, response)
}

func (h *QueryHandler) Create(c *gin.Context) {
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
		Title string `json:"title" binding:"required"`
		Body  string `json:"body" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	query, err := h.queries.Create(c.Request.Context(), clerkUserID, workspaceID, service.CreateQueryInput{
		Title: body.Title,
		Body:  body.Body,
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
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "create_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, dto.NewQueryResponse(*query))
}

func (h *QueryHandler) Get(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	queryID, err := uuid.Parse(c.Param("queryId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid query id"}})
		return
	}

	query, err := h.queries.GetDetail(c.Request.Context(), clerkUserID, workspaceID, queryID)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if errors.Is(err, repository.ErrQueryNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "query not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "internal_error", "message": "failed to load query"}})
		return
	}

	c.JSON(http.StatusOK, dto.NewQueryDetailResponse(*query))
}

func (h *QueryHandler) CreateReply(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	queryID, err := uuid.Parse(c.Param("queryId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid query id"}})
		return
	}

	var body struct {
		Body          string  `json:"body" binding:"required"`
		ParentReplyID *string `json:"parentReplyId"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	var parentReplyID *uuid.UUID
	if body.ParentReplyID != nil && strings.TrimSpace(*body.ParentReplyID) != "" {
		parsed, err := uuid.Parse(*body.ParentReplyID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid parent reply id"}})
			return
		}
		parentReplyID = &parsed
	}

	reply, err := h.queries.CreateReply(c.Request.Context(), clerkUserID, workspaceID, queryID, service.CreateQueryReplyInput{
		Body:          body.Body,
		ParentReplyID: parentReplyID,
	})
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if errors.Is(err, repository.ErrQueryNotFound) || errors.Is(err, repository.ErrQueryReplyNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "query or reply not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "create_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, dto.NewQueryReplyResponse(*reply))
}

func (h *QueryHandler) UpdateStatus(c *gin.Context) {
	clerkUserID, ok := middleware.ClerkUserID(c)
	if !ok {
		return
	}

	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid workspace id"}})
		return
	}

	queryID, err := uuid.Parse(c.Param("queryId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": "invalid query id"}})
		return
	}

	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "invalid_request", "message": err.Error()}})
		return
	}

	query, err := h.queries.UpdateStatus(c.Request.Context(), clerkUserID, workspaceID, queryID, body.Status)
	if errors.Is(err, repository.ErrUserNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "user_not_synced", "message": "user has not been synced yet"}})
		return
	}
	if errors.Is(err, repository.ErrWorkspaceNotFound) || errors.Is(err, repository.ErrMembershipNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "workspace not found"}})
		return
	}
	if errors.Is(err, repository.ErrQueryNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "query not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "update_failed", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.NewQueryResponse(*query))
}
