# Transcenders Makefile

all: prod

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

env-website:
		@scripts/env-gen.js website

.PHONY: setup-check env-local env-docker env-prod env-website

################################################################################
# DEVELOPMENT
################################################################################

docker: setup-check env-docker
		docker compose up -d

local: setup-check env-local
		npm run dev

dev-web: setup-check env-local
		npm run dev:frontend

dev-backend: setup-check env-local
		npm run dev:backend

dev-compiled: setup-check env-local
		npm run build
		npm run dev:compiled

dev-build:
		docker compose build

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
# DEV CERTS
################################################################################
# Windows (Admin PowerShell) trust:
#		certutil -addstore -f Root caddy-docker-root.crt
#		certutil -addstore -f Root caddy-local-root.crt
#
# Windows untrust:
#		certutil -delstore Root "Caddy Local Authority - 2025 ECC Root"
#		certutil -delstore CA   "Caddy Local Authority - ECC Intermediate"
################################################################################

CA_DOCKER_CERT=./caddy-docker-root.crt
CA_LOCAL_CERT=./caddy-local-root.crt
CA_DOCKER_ROOT=/data/caddy/pki/authorities/local/root.crt
CA_LOCAL_ROOT=./infra/caddy/caddy-data/pki/authorities/local/root.crt

get-ca:
	@echo "Exporting dev CA roots (docker + local if present)..."
	-@docker cp caddy:$(CA_DOCKER_ROOT) $(CA_DOCKER_CERT)
	-@cp "$(CA_LOCAL_ROOT)" "$(CA_LOCAL_CERT)"
	@echo "Exported (if present): $(CA_DOCKER_CERT) $(CA_LOCAL_CERT)"
	@echo "Next: 'make trust-ca' to install; or on Windows use Admin PowerShell:"
	@echo "    certutil -addstore -f Root $(CA_DOCKER_CERT)"
	@echo "    certutil -addstore -f Root $(CA_LOCAL_CERT)"

trust-ca:
	@OS=$$(uname); \
	echo "Installing CA(s) on $$OS..."; \
	if [ "$$OS" = "Darwin" ]; then \
		[ -f "$(CA_LOCAL_CERT)" ]  && sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$(CA_LOCAL_CERT)" || true; \
		[ -f "$(CA_DOCKER_CERT)" ] && sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$(CA_DOCKER_CERT)" || true; \
	elif [ "$$OS" = "Linux" ]; then \
		[ -f "$(CA_LOCAL_CERT)" ]  && sudo cp "$(CA_LOCAL_CERT)"  /usr/local/share/ca-certificates/ || true; \
		[ -f "$(CA_DOCKER_CERT)" ] && sudo cp "$(CA_DOCKER_CERT)" /usr/local/share/ca-certificates/ || true; \
		sudo update-ca-certificates || true; \
	else \
		echo "Windows detected. Use elevated PowerShell:"; \
		[ -f "$(CA_LOCAL_CERT)" ]  && echo "  certutil -addstore -f Root $$(pwd)\\$(notdir $(CA_LOCAL_CERT))"; \
		[ -f "$(CA_DOCKER_CERT)" ] && echo "  certutil -addstore -f Root $$(pwd)\\$(notdir $(CA_DOCKER_CERT))"; \
	fi
	@echo "✅ Done. Restart your browser."
	-@rm -f $(CA_DOCKER_CERT) $(CA_LOCAL_CERT)

.PHONY: trust-ca get-ca
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
		
prod-build: env-prod
		$(PROD_DOCKER_COMPOSE) build --parallel

prod-stop:
		$(PROD_DOCKER_COMPOSE) down

prod-restart: prod-stop prod

prod-clean:
		$(PROD_DOCKER_COMPOSE) down --rmi all
		
prod-fclean:
		$(PROD_DOCKER_COMPOSE) down -v --rmi all

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

prod-status:
		$(PROD_DOCKER_COMPOSE) ps

.PHONY: prod prod-build prod-stop prod-restart prod-logs prod-clean prod-fclean prod-exec prod-status

################################################################################
# WEBSITE DEPLOYMENT
################################################################################
WEBSITE_DOCKER_COMPOSE := docker compose -f docker-compose.website.yml

website: env-website
		$(WEBSITE_DOCKER_COMPOSE) build --parallel
		$(WEBSITE_DOCKER_COMPOSE) up -d

website-build: env-website
		$(WEBSITE_DOCKER_COMPOSE) build --parallel

website-rebuild: env-website
		$(WEBSITE_DOCKER_COMPOSE) build --parallel --no-cache

website-stop:
		$(WEBSITE_DOCKER_COMPOSE) down

website-restart: website-stop website

website-clean:
		$(WEBSITE_DOCKER_COMPOSE) down --rmi all
		
website-fclean:
		$(WEBSITE_DOCKER_COMPOSE) down -v --rmi all

website-logs:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		$(WEBSITE_DOCKER_COMPOSE) logs -f; \
	else \
		SVC=$(filter-out $@,$(MAKECMDGOALS)) && \
		$(WEBSITE_DOCKER_COMPOSE) logs $$SVC -f; \
	fi

website-exec:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Usage: make website-exec <service>"; \
	else \
		SVC=$(filter-out $@,$(MAKECMDGOALS)) && \
		$(WEBSITE_DOCKER_COMPOSE) exec -it $$SVC ash; \
	fi

website-status:
		@echo "Website Deployment Status:"
		@$(WEBSITE_DOCKER_COMPOSE) ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"

website-pull:
		@echo "ℹNote: Using local builds - pulling git changes instead"
		git pull origin main

website-deploy: website-pull env-website website-rebuild website
		@echo "Full website deployment completed"

website-update: website-pull website-restart
		@echo "Website updated and restarted"

website-health:
		@echo "🏥 Checking service health..."
		@$(WEBSITE_DOCKER_COMPOSE) ps --filter "status=running" --quiet | while read container; do \
			if [ -n "$$container" ]; then \
				echo "✅ Container $$container is running"; \
			fi; \
		done
		@$(WEBSITE_DOCKER_COMPOSE) ps --filter "status=exited" --quiet | while read container; do \
			if [ -n "$$container" ]; then \
				echo "❌ Container $$container has exited"; \
			fi; \
		done

.PHONY: website website-build website-rebuild website-stop website-restart website-logs website-clean website-fclean website-exec website-status website-pull website-deploy website-update website-health

################################################################################
# CLEAN
################################################################################

clean-artifacts:
		-@docker run --rm \
				-v .:/workspace \
				--user root \
				busybox:1.36-musl \
				/workspace/scripts/artifact-cleanup.sh

fclean: clean clean-artifacts
		-rm -rf web/.vite
		-npm run clean-turbo

clean: dev-stop prod-stop website-stop
		-docker compose down --remove-orphans --rmi all
		-docker system prune -f
		-npm run clean

clean-volumes: dev-stop prod-stop website-stop
		docker compose down -v --remove-orphans --rmi all
		$(PROD_DOCKER_COMPOSE) down -v --remove-orphans --rmi all
		$(WEBSITE_DOCKER_COMPOSE) down -v --remove-orphans --rmi all
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
		@echo "  env-website     Generate website deployment environment files"
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
		@echo "  prod-build      Build production containers"
		@echo "  prod-stop       Stop production environment"
		@echo "  prod-restart    Restart production environment"
		@echo "  prod-logs       Show production logs"
		@echo "  prod-status     Show production service status"
		@echo "  prod-clean      Clean production containers and images"
		@echo "  prod-fclean     Clean production including volumes"
		@echo ""
		@echo "Website Deployment:"
		@echo "  website         Start website deployment"
		@echo "  website-build   Build website containers"
		@echo "  website-rebuild Rebuild website containers (no cache)"
		@echo "  website-stop    Stop website deployment"
		@echo "  website-restart Restart website deployment"
		@echo "  website-logs    Show website logs"
		@echo "  website-status  Show website service status with ports"
		@echo "  website-health  Check website service health"
		@echo "  website-pull    Pull latest git changes"
		@echo "  website-deploy  Full deployment (git pull + rebuild + start)"
		@echo "  website-update  Quick update (git pull + restart)"
		@echo "  website-clean   Clean website containers and images"
		@echo "  website-fclean  Clean website including volumes"
		@echo ""
		@echo "Clean:"
		@echo "  clean           Stop all and clean Docker resources"
		@echo "  clean-volumes   Clean Docker resources including volumes"
		@echo "  clean-db        Remove all service databases"
		@echo "  clean-rebuild   Clean everything and rebuild from scratch"

.PHONY: help