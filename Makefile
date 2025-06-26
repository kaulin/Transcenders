# Transcenders Makefile - Docker management commands

all: setup-check dev web-dev

################################################################################
# SETUP
################################################################################

# Force setup
setup:
	@echo "Installing dependencies locally"
	npm ci --include=dev
	@touch .setup-complete

# Check if setup is needed
setup-check:
	@if [ ! -d "./node_modules" ] || [ ! -f ".setup-complete" ] || [ "package.json" -nt ".setup-complete" ] || [ "package-lock.json" -nt ".setup-complete" ]; then \
		echo "Running setup..."; \
		$(MAKE) setup; \
	else \
		echo "✅ Dependencies are up to date"; \
	fi

################################################################################
# DEVELOPMENT
################################################################################

# Development environment (hot-reloading)
dev:
	@echo "Starting development environment..."
	docker compose up -d

# Everything local (for developers who can't use containers)
local: setup-check
	@echo "Starting backend services locally..."
	@echo "Gateway Service at: http://localhost:4000"
	@echo "User Service at: http://localhost:3001"
	@echo "Auth Service at: http://localhost:3002"
	@echo "Score Service at: http://localhost:3003"
	@echo "Frontend at: http://localhost:5173"
	npm run dev:all

# Start development with visible logs
dev-logs: stop-dev
	@echo "Starting development environment with logs..."
	docker compose up

# Show logs
logs:
	docker compose logs -f

# Stop development containers
stop-dev:
	@echo "Checking for development containers..."
	docker compose down

# Restart development environment
restart: stop-dev dev
	@echo "Development environment restarted"

################################################################################
# WEB FRONTEND
################################################################################

# Start web development server (local)
web-dev: setup-check
	@echo "Starting web development server..."
	npm run dev --workspace=web

################################################################################
# PRODUCTION
################################################################################

# Run production container using docker compose (builds if needed)
prod: stop-prod
	@echo "Starting production container..."
	docker compose -f docker-compose.prod.yml up -d

# Show production logs
logs-prod:
	docker logs -f transcenders-prod

# Stop production container using docker compose
stop-prod:
	@echo "Stopping production container..."
	docker compose -f docker-compose.prod.yml down

################################################################################
# CLEAN
################################################################################

# Stop all containers
stop: stop-dev stop-prod
	@echo "All containers stopped"

# Rebuild dev environment clearly separated into build and start
rebuild: stop clean
	@echo "Completely rebuilding development environment..."
	docker compose build --no-cache
	docker compose up -d

# Clean everything (volumes, images)
clean: stop
	@echo "Cleaning all Docker resources..."
	docker compose down -v --remove-orphans --rmi all
	-docker system prune -f

cleandb:
	@echo cleaning all databases
	rm -rf ./services/gateway-service/data
	rm -rf ./services/user-service/data
	rm -rf ./services/auth-service/data
	rm -rf ./services/score-service/data

################################################################################
# HELP
################################################################################

help:
	@echo ""
	@echo "========== Transcenders Makefile =========="
	@echo ""
	@echo "Setup:"
	@echo "  make setup             Force install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make, make all         Start development environment (default)"
	@echo "  make dev               Start development (skip setup check)"
	@echo "  make dev-logs          Start development with visible logs"
	@echo "  make local             Run everything locally (no containers)"
	@echo "  make logs              Show development logs"
	@echo "  make restart           Restart development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod              Start production container"
	@echo "  make logs-prod         Show production logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make stop              Stop all containers"
	@echo "  make rebuild           Rebuild dev environment (no cache)"
	@echo "  make clean             Remove all containers and images"
	@echo "  make cleandb           remove all databases"
	@echo "  make help              Show this help message"
	@echo ""
	@echo "==========================================="

.PHONY: all dev dev-logs stop-prod stop-dev prod stop restart clean logs logs-prod help rebuild setup setup-check local web-setup web-dev
