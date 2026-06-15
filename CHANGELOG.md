# Changelog

All notable changes to this project will be documented in this file.

## [3.1.0] - 2026-06-01

Cooldown 3 release — incremental improvements, new features, and bugfixes accumulated since v3.0.0.

### Features
- **Health check** — add `/health` endpoint with version number, uptime, and environment info
- **Privacy notice** — add privacy notice page for GDPR compliance
- **GDPR guidelines** — add agent-safe development guidelines to AGENTS.md
- **File watching** — add debounced file watching for near real-time data refresh on scraper updates
- **Year range scraper** — add support for scraping races across year ranges
- **CORS config** — add `CORS_ORIGIN` env var for tour-ranking.com custom domain
- **Past seasons** — add endpoint for viewing races from past seasons
- **Today tab** — restore today tab processing for youth/teams stage results
- **Environment-based HTML processing** — implement template-based HTML processing
- **Prologue scraping** — add support for scraping prologue stage results
- **JS path aliases** — add `@client`, `@cycling`, `@server`, `@services`, `@utils`, `@scrappers` import aliases
- **Scraping error outputs** — add error reporting for scraper failures

### Fixes
- **CI/CD** — update flyctl to latest to fix deployment failures
- **Race temporal grouping** — normalise date comparison to UTC
- **Scraper** — skip entries with empty bib in points/mountains location contests
- **Scraper** — handle bare intermediate sprint labels in sprintLocation
- **Scraper** — collect stage details for future races and add HTML caching
- **Scraper** — refactor race data scraping and improve type safety
- **Scraper** — fix prologue scraping edge cases
- **Templates** — correct prologue stage display with case-insensitive check
- **Models** — validate `DATA_DIR` environment variable before use
- **Data service** — guard `dispose()` to prevent multiple calls
- **Health** — improve robustness and reliability of health endpoint
- **Deps** — remove Puppeteer/Chrome references from DEPLOYMENT.md

### Refactoring
- **CI/CD** — harden security and optimise deployment config
- **Server** — centralise error handling, use path aliases, add presenters
- **Scraper** — normalise CSV output by removing redundant rider metadata
- **Models** — refactor model fields and remove full rider name
- **HTML scraping** — refactor with caching support and centralised config
- **Server directory** — relocate `/server` under `/src/`
- **Dependencies** — upgrade Express 5.x, update ESLint config, remove Puppeteer

### Documentation
- **AGENTS.md** — add Shape Up issue creation guidelines
- **DEPLOYMENT.md** — create deployment documentation
- **Cycling domain** — add data model type definitions and ID generator documentation

### Testing
- Add tests for scraping race stages, stage results, and startlists
- Add tests for race scraping validation
- Add CSV content validation tests
- Standardise test naming conventions
- Improve type safety in health routes tests

### Infrastructure
- **Dockerfile** — add procps for debugging
- **ESLint** — updated configuration and dev dependencies
- **CI/CD** — harden security and optimise deployment configuration
