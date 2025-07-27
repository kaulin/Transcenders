# Transcenders Makefile - Docker management commands

all: dev web-dev

################################################################################
# SETUP
################################################################################

# Use the shared dependency check script for local setup
setup-check: env-host vite-env
	@./scripts/docker-deps-check.sh
	
ENV_FILE := .env
env-host:
	@touch .env
	@grep -q '^HOST_UID=' $(ENV_FILE) || echo "\nHOST_UID=$$(id -u)" >> $(ENV_FILE)
	@grep -q '^HOST_GID=' $(ENV_FILE) || echo "\nHOST_GID=$$(id -g)" >> $(ENV_FILE)
	
ENV_DIR := env
SERVICES := $(ENV_DIR)/services.env
SERVICES_LOCAL := $(ENV_DIR)/services-local.env
VITE_ENV := $(ENV_DIR)/vite.env

.PHONY: env vite-env
env:
	@mkdir -p $(ENV_DIR)
	@grep -q '^USER_SERVICE_URL=' $(SERVICES) || echo 'USER_SERVICE_URL=http://user-service:3001' >> $(SERVICES)
	@grep -q '^AUTH_SERVICE_URL=' $(SERVICES) || echo 'AUTH_SERVICE_URL=http://auth-service:3002' >> $(SERVICES)
	@grep -q '^SCORE_SERVICE_URL=' $(SERVICES) || echo 'SCORE_SERVICE_URL=http://score-service:3003' >> $(SERVICES)
	@grep -q '^USER_SERVICE_URL=' $(SERVICES_LOCAL) || echo 'USER_SERVICE_URL=http://localhost:3001' >> $(SERVICES_LOCAL)
	@grep -q '^AUTH_SERVICE_URL=' $(SERVICES_LOCAL) || echo 'AUTH_SERVICE_URL=http://localhost:3002' >> $(SERVICES_LOCAL)
	@grep -q '^SCORE_SERVICE_URL=' $(SERVICES_LOCAL) || echo 'SCORE_SERVICE_URL=http://localhost:3003' >> $(SERVICES_LOCAL)

vite-env: env
	@awk -F= '/^[A-Z_]+=/ {print "VITE_"$$1"="$$2}' $(SERVICES) > $(VITE_ENV)

################################################################################
# DEVELOPMENT
################################################################################

# Development environment (hot-reloading)
dev: setup-check
	@echo "Starting development environment..."
	docker compose up -d

# Everything local (for developers who can't use containers)
local: setup-check
	@echo "Starting backend services locally..."
	@echo "User Service at: http://localhost:3001"
	@echo "Auth Service at: http://localhost:3002"
	@echo "Score Service at: http://localhost:3003"
	@echo "Frontend at: http://localhost:5173"
	npm run dev:all

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
web-dev:
	@echo "Starting web development server..."
	npm run dev --workspace=web
	
################################################################################
# DEPENDENCY MANAGEMENT
################################################################################

# Find unused files, dependencies, and exports using knip
audit-project:
		@echo "🔍 Running comprehensive project audit with knip..."
		@echo "   (Finds unused files, dependencies, exports, and dead code)"
		npx knip

# Check for outdated dependencies across all workspaces
check-outdated:
		@echo "📅 Checking for outdated dependencies..."
		@echo "   (Shows which packages have newer versions available)"
		npm outdated --workspaces

# Update all dependencies to latest versions (interactive)
update-deps:
		@echo "⬆️  Updating dependencies interactively..."
		@echo "   (Uses npm-check-updates to update package.json files)"
		@echo "   (Run this carefully - test after updating!)"
		npx npm-check-updates --interactive --workspaces

# Clean install dependencies (removes node_modules and reinstalls)
clean-install:
		@echo "🧹 Clean installing all dependencies..."
		@echo "   (Removes node_modules and package-lock.json, then reinstalls)"
		rm -rf node_modules package-lock.json
		npm install

# Full dependency health check
deps-health:
		@echo "🏥 Running full dependency health check..."
		@echo ""
		$(MAKE) check-outdated
		@echo ""
		$(MAKE) audit-project

################################################################################
# BUILD & PRODUCTION
################################################################################

# Build everything for production
build:
		@echo "🔨 Building all packages and services for production..."
		npm run build

# Clean all build artifacts
clean-build:
		@echo "🧹 Cleaning all build artifacts..."
		npm run clean

# Test production build locally (without Docker)
test-prod-local: build
		@echo "🧪 Testing production build locally..."
		npm run start:all &
		@echo "Waiting for services to start..."
		sleep 5
		@echo "Testing endpoints..."
		@curl -f http://localhost:3001/ping && echo "✅ User service OK"
		@curl -f http://localhost:3002/ping && echo "✅ Auth service OK"  
		@curl -f http://localhost:3003/ping && echo "✅ Score service OK"
		@pkill -f "node dist/server.js" || true

# Full production workflow test
prod-workflow: clean-build build test-prod-local
		@echo "✅ Production workflow complete and tested!"

################################################################################
# DOCKER PRODUCTION
################################################################################

# Build production Docker images
build-prod:
		@echo "🐳 Building production Docker images..."
		docker compose -f docker-compose.prod.yml build --parallel

# Start production environment
prod: build-prod
		@echo "🚀 Starting production environment..."
		docker compose -f docker-compose.prod.yml up -d

# Stop production
stop-prod:
		@echo "🛑 Stopping production..."
		docker compose -f docker-compose.prod.yml down

# Production logs
logs-prod:
		@echo "📋 Production logs..."
		docker compose -f docker-compose.prod.yml logs -f

# Clean production
clean-prod:
		@echo "🧹 Cleaning production..."
		docker compose -f docker-compose.prod.yml down --rmi all --volumes

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
	$(MAKE) dev

# Clean everything (images)
clean: stop
	@echo "Cleaning Docker resources... images"
	docker compose down --remove-orphans --rmi all
	-docker system prune -f
	
clean-volumes: stop
	@echo "Cleaning Docker resources... volumes"
	docker compose down -v --remove-orphans --rmi all
	-docker system prune -f

cleandb:
	@echo cleaning all databases
	rm -rf ./services/user-service/data
	rm -rf ./services/auth-service/data
	rm -rf ./services/score-service/data
	
clean-node:
	@echo cleaning all node_modules
	rm -rf node_modules
	rm -rf web/node_modules

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
		@echo "  make local             Run everything locally (no containers)"
		@echo "  make logs              Show development logs"
		@echo "  make restart           Restart development environment"
		@echo ""
		@echo "Dependency Management:"
		@echo "  make audit-project     Comprehensive audit with knip (unused files/exports)"
		@echo "  make check-outdated    Check for outdated dependencies"
		@echo "  make update-deps       Update dependencies interactively"
		@echo "  make update-docker-deps Update Docker shared dependencies"
		@echo "  make clean-install     Clean install all dependencies"
		@echo "  make deps-health       Run full dependency health check"
		@echo ""
		@echo "Production:"
		@echo "  make prod              Start production container"
		@echo "  make logs-prod         Show production logs"
		@echo ""
		@echo "Utilities:"
		@echo "  make stop              Stop all containers"
		@echo "  make rebuild           Rebuild dev environment (no cache)"
		@echo "  make clean             Remove all containers and images"
		@echo "  make cleandb           Remove all databases"
		@echo "  make help              Show this help message"
		@echo ""
		@echo "==========================================="

.PHONY: all dev stop-prod stop-dev prod stop restart clean logs logs-prod help rebuild setup setup-check local web-dev audit-project check-outdated update-deps update-docker-deps clean-install deps-health envs
