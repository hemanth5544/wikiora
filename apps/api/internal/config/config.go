package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	AppEnv               string
	APIPort              string
	DatabaseURL          string
	RedisURL             string
	ClerkSecretKey       string
	ClerkWebhookSecret   string
	CORSAllowedOrigins   []string
}

func Load() (*Config, error) {
	cfg := &Config{
		AppEnv:             getEnv("APP_ENV", "development"),
		APIPort:            resolveListenPort(),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		RedisURL:           os.Getenv("REDIS_URL"),
		ClerkSecretKey:     os.Getenv("CLERK_SECRET_KEY"),
		ClerkWebhookSecret: os.Getenv("CLERK_WEBHOOK_SIGNING_SECRET"),
		CORSAllowedOrigins: splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
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
