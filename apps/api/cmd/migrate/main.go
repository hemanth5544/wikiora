package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/wikiora/wikiora/apps/api/internal/config"
	"github.com/wikiora/wikiora/apps/api/internal/platform/logger"
	"github.com/wikiora/wikiora/apps/api/internal/platform/postgres"
)

// One-off / CI migrations against DATABASE_URL. Do not rely on AutoMigrate during Vercel cold starts.
func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	logr := logger.New(cfg.AppEnv)
	_ = os.Setenv("DB_AUTO_MIGRATE", "false")

	db, err := postgres.Connect(
		cfg.DatabaseURL,
		cfg.AppEnv,
		logr,
		cfg.DBMaxOpenConns,
		cfg.DBMaxIdleConns,
		cfg.DBConnMaxLifetime,
	)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}

	// Always migrate when this command is invoked (including production DATABASE_URL).
	if err := postgres.Migrate(db); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	logr.Info("migrations applied successfully")
	os.Exit(0)
}
