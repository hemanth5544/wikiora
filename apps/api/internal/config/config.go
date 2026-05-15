package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv               string
	APIPort              string
	DatabaseURL          string
	RedisURL             string
	ClerkSecretKey       string
	ClerkWebhookSecret   string
	CORSAllowedOrigins   []string
	DBMaxOpenConns       int
	DBMaxIdleConns       int
	DBConnMaxLifetime    time.Duration
}

func Load() (*Config, error) {
	appEnv := getEnv("APP_ENV", "development")
	maxOpen, maxIdle, lifetime := dbPoolDefaults(appEnv)

	cfg := &Config{
		AppEnv:               appEnv,
		APIPort:              resolveListenPort(),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		RedisURL:             os.Getenv("REDIS_URL"),
		ClerkSecretKey:       os.Getenv("CLERK_SECRET_KEY"),
		ClerkWebhookSecret:   os.Getenv("CLERK_WEBHOOK_SIGNING_SECRET"),
		CORSAllowedOrigins:   splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		DBMaxOpenConns:       maxOpen,
		DBMaxIdleConns:       maxIdle,
		DBConnMaxLifetime:    lifetime,
	}

	if v := strings.TrimSpace(os.Getenv("DB_MAX_OPEN_CONNS")); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			cfg.DBMaxOpenConns = n
		}
	}
	if v := strings.TrimSpace(os.Getenv("DB_MAX_IDLE_CONNS")); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			cfg.DBMaxIdleConns = n
		}
	}
	if v := strings.TrimSpace(os.Getenv("DB_CONN_MAX_LIFETIME")); v != "" {
		if d, err := time.ParseDuration(v); err == nil && d > 0 {
			cfg.DBConnMaxLifetime = d
		}
	}
	if cfg.DBMaxIdleConns > cfg.DBMaxOpenConns {
		cfg.DBMaxIdleConns = cfg.DBMaxOpenConns
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.ClerkSecretKey == "" {
		return nil, fmt.Errorf("CLERK_SECRET_KEY is required")
	}
	if strings.Contains(cfg.ClerkSecretKey, "your_clerk_secret_key") {
		return nil, fmt.Errorf("CLERK_SECRET_KEY is still the example placeholder; copy the secret key from your Clerk dashboard into apps/api/.env")
	}

	return cfg, nil
}

// dbPoolDefaults uses a tiny pool when PORT is set (Vercel/serverless) so hosted Postgres
// is not exhausted. Otherwise development gets a larger pool; production defaults are moderate.
func dbPoolDefaults(appEnv string) (maxOpen, maxIdle int, lifetime time.Duration) {
	if strings.TrimSpace(os.Getenv("PORT")) != "" {
		return 2, 1, 5 * time.Minute
	}
	if appEnv == "development" {
		return 10, 5, 30 * time.Minute
	}
	return 10, 5, 15 * time.Minute
}

// resolveListenPort returns the HTTP listen port.
// Vercel, Railway, Render, etc. set PORT; local dev often uses API_PORT or 8080.
func resolveListenPort() string {
	if p := strings.TrimSpace(os.Getenv("PORT")); p != "" {
		return p
	}
	return getEnv("API_PORT", "8080")
}

func getEnv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}
