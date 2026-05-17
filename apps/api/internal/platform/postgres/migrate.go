package postgres

import (
	"fmt"
	"log/slog"
	"os"
	"strings"

	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/gorm"
)

// AutoMigrateEnabled reports whether Connect should run GORM AutoMigrate on startup.
// Migrations are opt-in only (DB_AUTO_MIGRATE=true) so serverless hosts like Vercel never
// run hundreds of slow catalog queries before the process can listen on PORT.
func AutoMigrateEnabled() bool {
	switch strings.ToLower(strings.TrimSpace(os.Getenv("DB_AUTO_MIGRATE"))) {
	case "1", "true", "yes":
		return true
	default:
		return false
	}
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
