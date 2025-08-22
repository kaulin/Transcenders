# Transcenders Makefile

all: local

################################################################################
# SETUP
################################################################################

setup-check:
		@./scripts/docker-deps-check.sh

env-local:
		@scripts/env-gen.js local

env-docker:
		@scripts/env-gen.js docker

env-prod:
		@scripts/env-gen.js production

.PHONY: setup-check env-local env-docker env-prod

################################################################################
# DEVELOPMENT
################################################################################

docker: setup-check env-docker
		docker compose up -d
		$(MAKE) dev-web

local: setup-check env-local
		npm run dev

dev-web: setup-check env-local
		npm run dev:frontend

dev-backend: setup-check env-local
		npm run dev:backend

dev-compiled: setup-check env-local
		npm run build
		npm run dev:compiled

dev-logs:
		docker compose logs -f

stop:
		docker compose down

dev-exec:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Usage: make dev-exec <service>"; \
	else \
		SVC=$(filter-out $@,$(MAKECMDGOALS)) && \
		docker compose exec -it $$SVC ash; \
	fi

restart: stop dev

.PHONY: dev dev-local dev-web dev-backend dev-compiled dev-logs dev-stop dev-restart

################################################################################
# BUILD & TESTING
################################################################################

build: setup-check env-local
		npm run build

build-clean:
		npm run clean

check-types:
		npm run type-check

check-lint:
		npm run lint

check-outdated:
		npm outdated --workspaces

check-audit:
		npx knip

fix-lint:
		npm run lint:fix

fix-deps:
		npx npm-check-updates --interactive --workspaces

test: setup-check env-local
		npm run test

install-clean:
		rm -rf node_modules package-lock.json
		npm install

.PHONY: build build-clean check-types check-lint check-outdated check-audit fix-lint fix-deps test install-clean

################################################################################
# PRODUCTION
################################################################################
PROD_DOCKER_COMPOSE := docker compose -f docker-compose.pruned.yml

prod: env-prod
		$(PROD_DOCKER_COMPOSE) build --parallel
		$(PROD_DOCKER_COMPOSE) up -d

prod-stop:
		$(PROD_DOCKER_COMPOSE) down

prod-clean:
		$(PROD_DOCKER_COMPOSE) down --rmi all

prod-logs:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		$(PROD_DOCKER_COMPOSE) logs -f; \
	else \
		SVC=$(filter-out $@,$(MAKECMDGOALS)) && \
		$(PROD_DOCKER_COMPOSE) logs $$SVC -f; \
	fi

prod-exec:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Usage: make prod-exec <service>"; \
	else \
		SVC=$(filter-out $@,$(MAKECMDGOALS)) && \
		$(PROD_DOCKER_COMPOSE) exec -it $$SVC ash; \
	fi

.PHONY: prod prod-local prod-stop prod-logs prod-clean prod-clean-data

################################################################################
# CLEAN
################################################################################

clean: dev-stop
		docker compose down --remove-orphans --rmi all
		docker system prune -f
		npm run clean

clean-volumes: dev-stop prod-stop
		docker compose down -v --remove-orphans --rmi all
		docker system prune -f

clean-db:
		rm -rf ./services/*/data
		rm -rf ./database

clean-rebuild: clean
		docker compose build --no-cache
		$(MAKE) dev

.PHONY: clean clean-volumes clean-db clean-rebuild

################################################################################
# HELP
################################################################################

help:
		@echo "Transcenders Development Commands"
		@echo ""
		@echo "Setup:"
		@echo "  setup-check     Check dependencies and generate local env"
		@echo "  env-local       Generate local environment files"
		@echo "  env-docker      Generate Docker environment files"
		@echo "  env-prod        Generate production environment files"
		@echo ""
		@echo "Development:"
		@echo "  dev             Start Docker development environment"
		@echo "  dev-local       Start all services locally with npm"
		@echo "  dev-web         Start frontend development server"
		@echo "  dev-backend     Start backend services only"
		@echo "  dev-compiled    Build and run compiled services"
		@echo "  dev-logs        Show development logs"
		@echo "  dev-stop        Stop development environment"
		@echo "  dev-restart     Restart development environment"
		@echo ""
		@echo "Build & Testing:"
		@echo "  build           Build all packages and services"
		@echo "  build-clean     Clean all build artifacts"
		@echo "  check-types     Run TypeScript type checking"
		@echo "  check-lint      Run linting"
		@echo "  check-outdated  Check for outdated dependencies"
		@echo "  check-audit     Audit project for unused code/deps"
		@echo "  fix-lint        Fix linting issues"
		@echo "  fix-deps        Update dependencies interactively"
		@echo "  test            Run tests"
		@echo "  install-clean   Clean install dependencies"
		@echo ""
		@echo "Production:"
		@echo "  prod            Start production Docker environment"
		@echo "  prod-local      Start production build locally"
		@echo "  prod-stop       Stop production environment"
		@echo "  prod-logs       Show production logs"
		@echo "  prod-clean      Clean production containers and images"
		@echo ""
		@echo "Clean:"
		@echo "  clean           Stop all and clean Docker resources"
		@echo "  clean-volumes   Clean Docker resources including volumes"
		@echo "  clean-db        Remove all service databases"
		@echo "  clean-rebuild   Clean everything and rebuild from scratch"

.PHONY: help