# Transcenders Makefile - Docker management commands

################################################################################
# DEVELOPMENT
################################################################################

all: setup dev

# Install dependencies locally for VSCode IntelliSense
setup:
	@echo "Installing dependencies locally"
	npm ci --include=dev

# Development environment (hot-reloading)
dev:
	@echo "Starting development environment..."
	docker compose up -d

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
rebuild: stop
	@echo "Completely rebuilding development environment..."
	docker compose build --no-cache
	docker compose up -d

# Clean everything (volumes, images)
clean: stop
	@echo "Cleaning all Docker resources..."
	docker compose down
	-docker rmi auth-service:hive
	-docker system prune -f

################################################################################
# HELP
################################################################################

help:
	@echo ""
	@echo "========== Transcenders Makefile =========="
	@echo ""
	@echo "Development:"
	@echo "  make, make all         Start development environment (default)"
	@echo "  make dev-logs          Start development with visible logs"
	@echo "  make restart           Restart development environment"
	@echo "  make logs              Show development logs"
	@echo "  make stop-dev          Stop development containers"
	@echo ""
	@echo "Production:"
	@echo "  make prod              Run production container (builds if needed)"
	@echo "  make logs-prod         Show production logs"
	@echo "  make stop-prod         Stop production container"
	@echo ""
	@echo "Utilities:"
	@echo "  make stop              Stop all containers"
	@echo "  make rebuild           Rebuild dev environment (no cache)"
	@echo "  make clean             Remove all containers, volumes, and images"
	@echo ""
	@echo "==========================================="

.PHONY: all dev dev-logs stop-prod stop-dev prod stop restart clean logs logs-prod help rebuild setup
