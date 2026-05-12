package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	svix "github.com/svix/svix-webhooks/go"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

type WebhookHandler struct {
	users         *service.UserService
	webhookSecret string
}

func NewWebhookHandler(users *service.UserService, webhookSecret string) *WebhookHandler {
	return &WebhookHandler{users: users, webhookSecret: webhookSecret}
}

type clerkWebhookEvent struct {
	Type string `json:"type"`
	Data struct {
		ID             string `json:"id"`
		FirstName      string `json:"first_name"`
		LastName       string `json:"last_name"`
		ImageURL       string `json:"image_url"`
		EmailAddresses []struct {
			EmailAddress string `json:"email_address"`
		} `json:"email_addresses"`
		PrimaryEmailAddressID string `json:"primary_email_address_id"`
	} `json:"data"`
}

func (h *WebhookHandler) Clerk(c *gin.Context) {
	if h.webhookSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{
				"code":    "webhook_disabled",
				"message": "clerk webhook secret is not configured",
			},
		})
		return
	}

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "invalid_request",
				"message": "unable to read webhook body",
			},
		})
		return
	}

	wh, err := svix.NewWebhook(h.webhookSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "webhook_init_failed",
				"message": "unable to initialize webhook verifier",
			},
		})
		return
	}

	if err := wh.Verify(payload, c.Request.Header); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": gin.H{
				"code":    "invalid_signature",
				"message": "webhook verification failed",
			},
		})
		return
	}

	var event clerkWebhookEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "invalid_request",
				"message": "invalid webhook payload",
			},
		})
		return
	}

	switch event.Type {
	case "user.created", "user.updated":
		email := primaryEmail(event.Data.EmailAddresses)
		if email == "" {
			c.JSON(http.StatusOK, gin.H{"received": true})
			return
		}

		_, err := h.users.SyncFromClerk(c.Request.Context(), service.ClerkUserPayload{
			ClerkUserID: event.Data.ID,
			Email:       email,
			FirstName:   event.Data.FirstName,
			LastName:    event.Data.LastName,
			AvatarURL:   event.Data.ImageURL,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": gin.H{
					"code":    "sync_failed",
					"message": err.Error(),
				},
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"received": true})
}

func primaryEmail(addresses []struct {
	EmailAddress string `json:"email_address"`
}) string {
	for _, address := range addresses {
		if address.EmailAddress != "" {
			return address.EmailAddress
		}
	}
	return ""
}
