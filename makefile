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
# PACKAGE MANAGEMENT
################################################################################

# Add a package (fast, avoids rebuild)
add:
	@read -p "Enter package name: " package; \
	echo "Installing $$package locally..."; \
	npm install $$package; \
	echo "Ensuring development container is running..."; \
	docker compose up -d dev; \
	echo "Installing $$package in container..."; \
	docker compose exec dev npm install $$package; \
	echo "Package $$package installed successfully."

# Remove a package (fast, avoids rebuild)
remove:
	@read -p "Enter package name: " package; \
	echo "Removing $$package locally..."; \
	npm uninstall $$package; \
	echo "Ensuring development container is running..."; \
	docker compose up -d dev; \
	echo "Removing $$package from container..."; \
	docker compose exec dev npm uninstall $$package; \
	echo "Package $$package removed successfully."

# Verify package installation
verify:
	@read -p "Enter package name: " package; \
	echo "Ensuring development container is running..."; \
	docker compose up -d dev; \
	echo "Checking $$package in container..."; \
	docker compose exec dev npm ls $$package; \
	echo "Checking $$package locally..."; \
	npm ls $$package

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
	docker compose down -v
	-docker rmi transcenders-prod:hive
	-docker rmi transcenders-dev:hive
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
	@echo "Package Management:"
	@echo "  make add               Add a package (prompts for name)"
	@echo "  make remove            Remove a package (prompts for name)"
	@echo "  make verify            Verify package installation (prompts for name)"
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

.PHONY: all dev dev-logs stop-prod stop-dev prod stop restart clean logs logs-prod help add remove verify rebuild setup
