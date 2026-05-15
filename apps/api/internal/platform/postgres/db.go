package postgres

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(
	databaseURL string,
	appEnv string,
	log *slog.Logger,
	maxOpenConns int,
	maxIdleConns int,
	connMaxLifetime time.Duration,
) (*gorm.DB, error) {
	gormLogger := logger.Default.LogMode(logger.Silent)
	if appEnv == "development" {
		gormLogger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{Logger: gormLogger})
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("sql db: %w", err)
	}
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)

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

	log.Info("database connected", "max_open", maxOpenConns, "max_idle", maxIdleConns)
	return db, nil
}
