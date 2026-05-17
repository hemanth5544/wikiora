.PHONY: up down api web dev migrate

up:
	docker compose up -d

down:
	docker compose down

api:
	cd apps/api && go run ./cmd/migrate && go run ./cmd/server

web:
	cd apps/web && npm run dev

dev:
	$(MAKE) up
	@echo "API: make api"
	@echo "Web: make web"

migrate:
	cd apps/api && go run ./cmd/migrate
