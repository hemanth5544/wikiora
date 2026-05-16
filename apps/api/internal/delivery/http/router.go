package http

import (
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/wikiora/wikiora/apps/api/internal/delivery/http/handlers"
	"github.com/wikiora/wikiora/apps/api/internal/delivery/http/middleware"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

type RouterDeps struct {
	Health     *handlers.HealthHandler
	Users      *handlers.UserHandler
	Workspaces *handlers.WorkspaceHandler
	Queries    *handlers.QueryHandler
	Invites    *handlers.InviteHandler
	Webhook    *handlers.WebhookHandler
	UsersSvc   *service.UserService
	Log        *slog.Logger
	Origins    []string
}

func NewRouter(deps RouterDeps) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(deps.Origins))

	router.GET("/health", deps.Health.Health)

	v1 := router.Group("/api/v1")
	{
		v1.POST("/webhooks/clerk", deps.Webhook.Clerk)

		protected := v1.Group("")
		protected.Use(middleware.ClerkAuth())
		protected.Use(middleware.EnsureLocalUser(deps.UsersSvc, deps.Log))
		{
			protected.GET("/users/me", deps.Users.Me)
			protected.POST("/users/sync", deps.Users.Sync)

			protected.GET("/queries", deps.Queries.ListFeed)
			protected.GET("/queries/mine", deps.Queries.ListMine)

			protected.POST("/workspaces", deps.Workspaces.Create)
			protected.GET("/workspaces", deps.Workspaces.List)
			protected.GET("/workspaces/:id", deps.Workspaces.Get)
			protected.PUT("/workspaces/:id", deps.Workspaces.Update)
			protected.GET("/workspaces/:id/members", deps.Workspaces.ListMembers)
			protected.PATCH("/workspaces/:id/members/:userId", deps.Workspaces.UpdateMemberRole)
			protected.GET("/workspaces/:id/queries", deps.Queries.List)
			protected.POST("/workspaces/:id/queries", deps.Queries.Create)
			protected.GET("/workspaces/:id/queries/:queryId", deps.Queries.Get)
			protected.POST("/workspaces/:id/queries/:queryId/replies", deps.Queries.CreateReply)
			protected.PATCH("/workspaces/:id/queries/:queryId", deps.Queries.UpdateStatus)

			protected.GET("/invites", deps.Invites.ListMine)
			protected.POST("/invites/accept", deps.Invites.Accept)
			protected.POST("/workspaces/:id/invites", deps.Invites.Create)
			protected.GET("/workspaces/:id/invites", deps.Invites.ListForWorkspace)
			protected.DELETE("/workspaces/:id/invites/:inviteId", deps.Invites.Revoke)
			protected.POST("/workspaces/:id/invites/:inviteId/resend", deps.Invites.Resend)
		}
	}

	return router
}
