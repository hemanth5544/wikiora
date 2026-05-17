package postgres

import (
	"fmt"
	"log/slog"
	"os"
	"strings"

	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/gorm"
)

// AutoMigrateEnabled reports whether Connect should run GORM AutoMigrate.
// Hosted/serverless deploys (Vercel) must skip startup migrations — each cold start
// would run hundreds of slow catalog queries against remote Postgres.
func AutoMigrateEnabled(appEnv string) bool {
	switch strings.ToLower(strings.TrimSpace(os.Getenv("DB_AUTO_MIGRATE"))) {
	case "1", "true", "yes":
		return true
	case "0", "false", "no":
		return false
	}
	if os.Getenv("VERCEL") == "1" || strings.TrimSpace(os.Getenv("VERCEL_ENV")) != "" {
		return false
	}
	return appEnv == "development"
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&domain.User{},
		&domain.Workspace{},
		&domain.WorkspaceMember{},
		&domain.WorkspaceInvite{},
		&domain.Query{},
		&domain.QueryReply{},
	)
}

func migrate(db *gorm.DB, log *slog.Logger) error {
	log.Info("running database migrations")
	if err := Migrate(db); err != nil {
		return fmt.Errorf("auto migrate: %w", err)
	}
	log.Info("database migrations complete")
	return nil
}
