# AMP MBG Makefile

.PHONY: help setup setup-fresh run stop install build clean db-up db-down db-push db-seed db-reset db-studio mail-up mail-down docker-build docker-up docker-down docker-logs test

DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_PROD = docker compose -f docker-compose.prod.yml

help:
	@echo "AMP MBG - Available Commands"
	@echo ""
	@echo "  make setup        First time setup (clean db + install + seed)"
	@echo "  make setup-fresh  Fresh setup (removes existing data)"
	@echo "  make run          Start development servers"
	@echo "  make stop         Stop all services"
	@echo "  make build        Build frontend + backend"
	@echo "  make clean        Remove node_modules and dist"
	@echo "  make test         Run backend tests"
	@echo ""
	@echo "  make db-up        Start PostgreSQL"
	@echo "  make db-down      Stop PostgreSQL"
	@echo "  make db-push      Apply schema"
	@echo "  make db-seed      Seed data"
	@echo "  make db-reset     Reset database"
	@echo "  make db-studio    Open Drizzle Studio"
	@echo ""
	@echo "  make mail-up      Start Stalwart mail server"
	@echo "  make mail-down    Stop Stalwart mail server"
	@echo ""
	@echo "  make docker-build Build production image"
	@echo "  make docker-up    Start production"
	@echo "  make docker-down  Stop production"
	@echo "  make docker-logs  View logs"

setup:
	@echo "[setup] Setting up..."
	@$(DOCKER_COMPOSE) down 2>/dev/null || true
	@docker volume rm ampmbg-postgres-data 2>/dev/null || true
	@cp -n apps/backend/.env.example apps/backend/.env.development 2>/dev/null || true
	@mkdir -p apps/backend/uploads
	bun install
	$(MAKE) db-up
	@sleep 3
	$(MAKE) db-push
	$(MAKE) db-seed
	@echo "[setup] Done! Run: make run"

setup-fresh: clean setup

run: db-up
	bun run dev

stop:
	@$(DOCKER_COMPOSE) down
	@pkill -f "bun" 2>/dev/null || true
	@echo "Stopped"

install:
	bun install

build:
	bun run build

clean:
	rm -rf node_modules apps/*/node_modules apps/*/dist apps/backend/uploads
	$(DOCKER_COMPOSE) down -v 2>/dev/null || true

db-up:
	@$(DOCKER_COMPOSE) up -d postgres
	@until docker exec ampmbg-postgres pg_isready -U ampmbg -d ampmbg_dev > /dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL ready"

db-down:
	$(DOCKER_COMPOSE) down

db-push:
	bun run db:push

db-seed:
	bun run db:seed

db-reset: db-down
	docker volume rm ampmbg-postgres-data 2>/dev/null || true
	$(MAKE) db-up
	@sleep 3
	$(MAKE) db-push
	$(MAKE) db-seed
	@echo "Database reset"

db-studio:
	bun run db:studio

mail-up:
	@$(DOCKER_COMPOSE) --profile mail up -d stalwart
	@echo "Stalwart ready at :8080"

mail-down:
	@$(DOCKER_COMPOSE) --profile mail down
	@echo "Stalwart stopped"

test:
	bun --cwd apps/backend test

docker-build:
	docker build -t ampmbg-backend:latest apps/backend

docker-up:
	$(DOCKER_COMPOSE_PROD) up -d

docker-down:
	$(DOCKER_COMPOSE_PROD) down

docker-logs:
	$(DOCKER_COMPOSE_PROD) logs -f
