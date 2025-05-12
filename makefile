# Transcenders Makefile - Docker management commands

all: dev

# Install dependencies locally for VSCode IntelliSense
setup:
	@echo "Installing dependencies locally"
	npm install

# Development environment (hot-reloading)
dev: setup stop
	@echo "Starting development environment..."
	docker compose up -d

# Start development with visible logs
dev-logs: stop
	@echo "Starting development environment with logs..."
	docker compose up

# Build development image
build:
	docker compose build

# Stop production container
stop-prod:
	@echo "Checking for production containers..."
	-docker stop transcenders-prod >/dev/null 2>&1
	-docker rm transcenders-prod >/dev/null 2>&1

# Stop development containers
stop-dev:
	@echo "Checking for development containers..."
	docker compose down

# Build production image
build-prod:
	docker build --target production -t transcenders:prod .

# Run production container
prod: build-prod stop
	@echo "Starting production container..."
	docker run --name transcenders-prod -p 3000:3000 -d transcenders:prod

# Stop all containers
stop: stop-dev stop-prod
	@echo "All containers stopped"

# Restart development environment
restart: stop dev
	@echo "Development environment restarted"

# Clean everything (volumes, images)
clean: stop
	@echo "Cleaning all Docker resources..."
	docker compose down -v
	-docker rmi transcenders:prod
	-docker rmi transcenders-api
	-docker system prune -f

# Show logs
logs:
	docker compose logs -f

# Show production logs
logs-prod:
	docker logs -f transcenders-prod

help:
	@echo "Available commands:"
	@echo "  make				- Start development environment (stops prod if running)"
	@echo "  make dev			- Start development environment (stops prod if running)"
	@echo "  make dev-logs		- Start development with visible logs"
	@echo "  make build			- Build development Docker image"
	@echo "  make build-prod	- Build production Docker image"
	@echo "  make prod			- Build and run production container (stops dev if running)"
	@echo "  make stop			- Stop all containers"
	@echo "  make restart		- Restart development environment"
	@echo "  make clean			- Remove all containers, volumes and images"
	@echo "  make logs			- Show development logs"
	@echo "  make logs-prod		- Show production logs"

.PHONY: all dev dev-logs build stop-prod stop-dev build-prod prod stop restart clean logs logs-prod help
