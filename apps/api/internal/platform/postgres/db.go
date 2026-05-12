package postgres

import (
	"fmt"
	"log/slog"

	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(databaseURL string, appEnv string, log *slog.Logger) (*gorm.DB, error) {
	gormLogger := logger.Default.LogMode(logger.Silent)
	if appEnv == "development" {
		gormLogger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{Logger: gormLogger})
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	if err := db.AutoMigrate(
		&domain.User{},
		&domain.Workspace{},
		&domain.WorkspaceMember{},
		&domain.WorkspaceInvite{},
		&domain.Query{},
		&domain.QueryReply{},
	); err != nil {
		return nil, fmt.Errorf("auto migrate: %w", err)
	}

	log.Info("database connected")
	return db, nil
}
