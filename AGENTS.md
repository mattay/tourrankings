# AGENTS.md - Agent Coding Guidelines

This file provides context and guidelines for agentic coding agents operating in this repository.

## Project Overview

Tour Rankings is a cycling race data website with two distinct parts:

1. **Scraper** - Collects race data from ProCyclingStats and writes to CSV
2. **Web App** - Express server + client-side JavaScript for visualization

- **Runtime**: Bun 1.3.0+ (ESM modules only, no CommonJS)
- **Server**: Express 5.x with EJS templating
- **Client**: Vanilla JS with D3 for visualizations

## Commands

### Scraper
```bash
bun scrape              # Run scraper to collect data
```

### Web App
```bash
bun start               # Start the web server
bun run build           # Build client assets
```

### Development
```bash
bun run lint            # Run ESLint
bun test                # Run all tests
bun test test/path/file.test.js  # Run single test file
bun test --watch        # Run tests in watch mode
```

### Docker
```bash
bun run local           # Start local development with Docker
bun run local:scrape    # Run scraper in Docker
bun run local:shell     # Open shell in Docker container
```

## Code Style

### Imports & Path Aliases

Use the path aliases defined in `jsconfig.json`:

```javascript
// Good
import { foo } from "@server/routes";
import dataService from "@services/dataServiceInstance";
import { toCamelCase } from "@utils/string";

// Avoid
import foo from "../../../services/foo";
```

Available aliases:
- `@client/*` - src/client/*
- `@cycling/*` - src/core/cycling/*
- `@server/*` - src/server/*
- `@services/*` - src/services/*
- `@utils/*` - src/utils/*
- `@scrappers/*` - src/scrappers/*

### ESM Modules

This project uses ESM exclusively. Use named imports where possible:

```javascript
// Good
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { logError, logOut } from "@utils/logging";

// NEVER use require() - it will fail at runtime in ESM
const { logOut } = require("@utils/logging");  // BAD: throws in ESM
```

### Naming Conventions

- **Variables/functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case.js

### JSDoc

Add JSDoc comments for public APIs, especially in the server and services:

```javascript
/**
 * Express application instance.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Sets up server middleware and configurations.
 * @param {import('express').Application} app - Express application instance.
 * @returns {Promise<void>}
 */
async function setupServer(app) { ... }
```

### ESLint Rules

- `console.warn` and `console.error` are allowed
- `console.log` triggers a warning
- Unused variables with `_` prefix are ignored (e.g., `_unusedVar`)

### Error Handling

Use the centralized error handler middleware:

```javascript
// In routes
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.statusCode = 404;
  next(error);
});
```

Errors should include a `statusCode` property. The middleware hides details in production.

## Git / Shape Up Workflow

### Branch Strategy

Branches follow the Shape Up methodology:

- `main` - Production-ready code, always deployable
- `cycle-{number}` - 6-week development cycles (e.g., `cycle-1`, `cycle-2`)
- `cooldown-{number}` - 2-week maintenance periods between cycles

### Feature Branches

Branch from the current cycle or cooldown branch:

- `bet/{description}` - Shaped work with defined appetite (1-6 weeks)
- `spike/{description}` - Technical exploration and research
- `bugfix/{description}` - Bug fixes during cooldown
- `deps/{description}` - Dependency updates
- `circuit-breaker/{description}` - Abandoned bets (keep for learning)

### Before Creating PR

1. **Rebase** your branch onto the current cycle/cooldown branch
2. Ensure all tests pass (`bun test`)
3. Run lint (`bun run lint`)

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `circuit`

Examples:
```
feat(scraper): add stage results parsing

Implements parsing of stage-by-stage results from ProCyclingStats
and writes them to CSV format.

Closes #45
```

```
fix(api): handle missing race data gracefully

Returns empty array instead of 500 error when no data exists.
```

### Merge Strategy

- **Bet → Cycle**: Merge commit with descriptive message
- **Cycle → Main**: Always merge commit, tag with `v{cycle}.0`
- **Hotfixes**: Create bugfix/ branch, merge to main, then merge to current cycle

## Project Structure

```
src/
├── scrappers/          # Data collection
│   ├── html/           # HTML fetching, parsing, caching
│   └── source/         # Site-specific scrapers
├── server/             # Express server
│   ├── routes/        # API and view routes
│   ├── middleware/    # Error handling, etc.
│   └── config/
├── services/           # Data loading from CSV
├── client/            # Browser-side code
│   ├── api/          # Client API calls
│   ├── domain/       # Cycling-specific parsing
│   └── styles/       # CSS
test/
├── scraping/          # Tests for scrapers
└── utils/            # Utility function tests
```

## CI/CD

GitHub Actions runs on PRs and pushes:

1. **Lint & Test** - `bun run lint` and `bun test`
2. **Security Scan** - `bun run audit`
3. **Docker Build** - Test production/dev builds
4. **Deploy** - Fly.io (dev from cycle/cooldown branches, prod from main)

## Known Issues & Technical Debt

### CSV Header Acronym Handling

The CSV data models use `toCamelCase()` to convert human-readable headers (e.g., "UCI", "GC") to property names. This creates inconsistencies with acronyms:

- `toCamelCase("UCI")` returns `"uCI"` (mixed case)
- Some models use `fieldTypes: { uci: "number" }` (lowercase)
- This mismatch causes type conversion to fail silently

**Current Workaround:**
Match fieldTypes keys exactly to `toCamelCase()` output:
```javascript
// For "UCI" header
fieldTypes: { uCI: "number" }  // Correct
fieldTypes: { uci: "number" }  // Wrong - won't convert
```

**Future Solution:**
See GitHub issue #341 for planned standardization to remove `toCamelCase()` and use camelCase headers directly.

## Development Tips

### For Solo Development

- **Self-merge** is acceptable after basic review
- **Skip ceremony** for quick fixes - don't over-formalize
- **Keep circuit breaker branches** - they're valuable for learning

### Pre-commit / Pre-push Hooks

Two hooks are available for faster feedback:

**Manual Setup Required** (create in repository hooks directory):

1. Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
bun run lint
```

2. Create `.git/hooks/pre-push`:
```bash
#!/bin/bash
bun run lint && bun test
```

3. Make executable:
```bash
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

Note: With git worktrees, hooks in the main `.git/hooks/` directory apply to all worktrees.

- **pre-commit**: Runs lint before every commit (fast feedback)
- **pre-push**: Runs lint + test before every push (comprehensive check)
