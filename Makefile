# Makefile - Simplified development commands
.PHONY: all help dev dev-docker build test lint clean \
        deploy-dev deploy-prod logs-dev logs-prod \
        cycle-start cycle-end cooldown ship status deploy-current

all: help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start local development with hot reload
	bun run dev:all

dev-docker: ## Start development using Docker (mirrors production)
	docker-compose -f docker-compose.dev.yml up --build

build: ## Build the project
	bun run build

test: ## Run tests
	bun test

lint: ## Run linting
	bun run lint

test-docker: ## Test Docker builds locally
	@echo "Testing production build..."
	docker build -t tourrankings:test .
	@echo "Testing development build..."
	docker build -f Dockerfile.dev -t tourrankings:test-dev .

clean: ## Clean up Docker resources
	docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
	docker system prune -f

# Deployment commands (requires flyctl and authentication)
deploy-dev: ## Deploy to development environment
	flyctl deploy --config fly.dev.toml --remote-only

deploy-prod: ## Deploy to production environment
	flyctl deploy --config fly.prod.toml --remote-only

logs-dev: ## View development logs
	flyctl logs --app tourrankings-dev

logs-prod: ## View production logs
	flyctl logs --app tourrankings

# Database/volume management
backup-dev: ## Backup development data
	flyctl volumes show --app tourrankings-dev

backup-prod: ## Backup production data
	flyctl volumes show --app tourrankings

# Shape Up workflow commands
cycle-start: ## Start a new Shape Up cycle (usage: make cycle-start N=1)
	@./scripts/shapeup.sh start-cycle $(N)

cycle-end: ## End current cycle and start cooldown (usage: make cycle-end N=1)
	@./scripts/shapeup.sh end-cycle $(N)

cooldown: ## Start cooldown phase (usage: make cooldown N=1)
	@./scripts/shapeup.sh start-cooldown $(N)

ship: ## Ship cooldown to production (usage: make ship N=1)
	@./scripts/shapeup.sh ship $(N)

status: ## Show current Shape Up cycle status
	@./scripts/shapeup.sh status

deploy-current: ## Deploy current branch to dev environment
	@./scripts/shapeup.sh deploy-dev
