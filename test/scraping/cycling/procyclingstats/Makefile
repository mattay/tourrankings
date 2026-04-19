# Fixture Generation Makefile
# Generates test fixtures from ProCyclingStats URLs

.PHONY: all races stages results classifications startlists help

# Default filters per domain
RACES_FILTER ?= {}
STAGES_FILTER ?= {}
RESULTS_FILTER ?= {"bibs":[],"ranks":[],"sample":10}
CLASSIFICATIONS_FILTER ?= {"bibs":[],"ranks":[],"sample":10}
STARTLISTS_FILTER ?= {"teams":[],"sample":5}

# Variables (override via command line)
NAME ?=
URL ?=

help:
	@echo "Fixture Generation Commands:"
	@echo "  make races NAME=<name> URL=<url> [FILTER=<json>]"
	@echo "  make stages NAME=<name> URL=<url> [FILTER=<json>]"
	@echo "  make results NAME=<name> URL=<url> [FILTER=<json>]"
	@echo "  make classifications NAME=<name> URL=<url> [FILTER=<json>]"
	@echo "  make startlists NAME=<name> URL=<url> [FILTER=<json>]"
	@echo ""
	@echo "Examples:"
	@echo '  make results NAME=tdu-2025-stage-1 URL=https://www.procyclingstats.com/race/tour-down-under/2025/stage-1'
	@echo '  make results NAME=tdu-stage-1-top3 FILTER="{\"ranks\":[1,2,3]}"'

races:
	@test -n "$(NAME)" || (echo "Error: NAME is required"; exit 1)
	@test -n "$(URL)" || (echo "Error: URL is required"; exit 1)
	bun generators/races.js --name=$(NAME) --url=$(URL) --filter='$(RACES_FILTER)'

stages:
	@test -n "$(NAME)" || (echo "Error: NAME is required"; exit 1)
	@test -n "$(URL)" || (echo "Error: URL is required"; exit 1)
	bun generators/stages.js --name=$(NAME) --url=$(URL) --filter='$(STAGES_FILTER)'

results:
	@test -n "$(NAME)" || (echo "Error: NAME is required"; exit 1)
	@test -n "$(URL)" || (echo "Error: URL is required"; exit 1)
	bun generators/results.js --name=$(NAME) --url=$(URL) --filter='$(RESULTS_FILTER)'

classifications:
	@test -n "$(NAME)" || (echo "Error: NAME is required"; exit 1)
	@test -n "$(URL)" || (echo "Error: URL is required"; exit 1)
	bun generators/classifications.js --name=$(NAME) --url=$(URL) --filter='$(CLASSIFICATIONS_FILTER)'

startlists:
	@test -n "$(NAME)" || (echo "Error: NAME is required"; exit 1)
	@test -n "$(URL)" || (echo "Error: URL is required"; exit 1)
	bun generators/startlists.js --name=$(NAME) --url=$(URL) --filter='$(STARTLISTS_FILTER)'
