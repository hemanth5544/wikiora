package postgres

import (
	"fmt"
	"log/slog"
	"time"

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

	if AutoMigrateEnabled() {
		if err := migrate(db, log); err != nil {
			return nil, err
		}
	} else {
		log.Info(
			"skipping auto migrate on startup",
			"hint", "set DB_AUTO_MIGRATE=true locally, or run: cd apps/api && go run ./cmd/migrate",
		)
	}

	log.Info("database connected", "max_open", maxOpenConns, "max_idle", maxIdleConns)
	return db, nil
}
