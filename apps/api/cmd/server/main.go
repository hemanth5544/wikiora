package main

import (
	"fmt"
	"log"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/joho/godotenv"
	"github.com/wikiora/wikiora/apps/api/internal/config"
	apphttp "github.com/wikiora/wikiora/apps/api/internal/delivery/http"
	"github.com/wikiora/wikiora/apps/api/internal/delivery/http/handlers"
	"github.com/wikiora/wikiora/apps/api/internal/platform/logger"
	"github.com/wikiora/wikiora/apps/api/internal/platform/postgres"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	clerk.SetKey(cfg.ClerkSecretKey)

	logr := logger.New(cfg.AppEnv)
	db, err := postgres.Connect(cfg.DatabaseURL, cfg.AppEnv, logr)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	workspaceRepo := repository.NewWorkspaceRepository(db)
	workspaceService := service.NewWorkspaceService(workspaceRepo, userRepo)
	inviteRepo := repository.NewInviteRepository(db)
	inviteService := service.NewInviteService(inviteRepo, workspaceRepo, userRepo)
	queryRepo := repository.NewQueryRepository(db)
	queryReplyRepo := repository.NewQueryReplyRepository(db)
	queryService := service.NewQueryService(queryRepo, queryReplyRepo, workspaceRepo, userRepo)

	router := apphttp.NewRouter(apphttp.RouterDeps{
		Health:     handlers.NewHealthHandler(),
		Users:      handlers.NewUserHandler(userService),
		Workspaces: handlers.NewWorkspaceHandler(workspaceService),
		Queries:    handlers.NewQueryHandler(queryService),
		Invites:    handlers.NewInviteHandler(inviteService),
		Webhook:    handlers.NewWebhookHandler(userService, cfg.ClerkWebhookSecret),
		UsersSvc:   userService,
		Log:        logr,
		Origins:    cfg.CORSAllowedOrigins,
	})

	addr := fmt.Sprintf("0.0.0.0:%s", cfg.APIPort)
	logr.Info("starting api server", "addr", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("run server: %v", err)
	}
}
