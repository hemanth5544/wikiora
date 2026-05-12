package middleware

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

const ClerkUserIDKey = "clerkUserID"

func ClerkAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := bearerToken(c.GetHeader("Authorization"))
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{
					"code":    "unauthorized",
					"message": "missing bearer token",
				},
			})
			return
		}

		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{Token: token})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{
					"code":    "unauthorized",
					"message": "invalid clerk session",
				},
			})
			return
		}

		c.Set(ClerkUserIDKey, claims.Subject)
		c.Next()
	}
}

func EnsureLocalUser(users *service.UserService, log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		clerkUserID, ok := ClerkUserID(c)
		if !ok {
			return
		}

		_, err := users.GetByClerkID(c.Request.Context(), clerkUserID)
		if err == nil {
			c.Next()
			return
		}
		if !errors.Is(err, repository.ErrUserNotFound) {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error": gin.H{
					"code":    "internal_error",
					"message": "failed to load local user",
				},
			})
			return
		}

		if _, err := users.EnsureFromClerkAPI(c.Request.Context(), clerkUserID); err != nil {
			log.Warn("failed to auto-sync clerk user", "clerkUserId", clerkUserID, "error", err)
		}

		c.Next()
	}
}

func ClerkUserID(c *gin.Context) (string, bool) {
	clerkUserID, ok := c.Get(ClerkUserIDKey)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": gin.H{
				"code":    "unauthorized",
				"message": "missing session",
			},
		})
		return "", false
	}
	return clerkUserID.(string), true
}

func bearerToken(header string) string {
	return strings.TrimPrefix(strings.TrimSpace(header), "Bearer ")
}
