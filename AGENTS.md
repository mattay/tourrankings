# AGENTS.md - Agent Coding Guidelines

This file provides context and guidelines for agentic coding agents operating in this repository.

## Project Overview

Tour Rankings is a website to visulise classification rankings of multi-stage cycling races with two distinct parts:

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

Add JSDoc comments for all functions and type definitons

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

#### Determining the Correct Rebase Target

The current integration branch is determined automatically by
`scripts/new-worktree.sh`. It picks the latest `cycle-*` or `cooldown-*`
branch, where `cooldown-N` is considered later than `cycle-N` for the same
number. You can also resolve it manually:

```bash
git branch --list 'cycle*' 'cooldown*' --format='%(refname:short)' \
  | grep -E '^(cycle|cooldown)(-[0-9]+)?$' \
  | awk -F- '{
      num = ($2 == "" ? 0 : $2)
      phase = ($1 == "cooldown" ? 1 : 0)
      print num " " phase " " $0
    }' \
  | sort -k1,1n -k2,2n \
  | tail -1 \
  | awk '{print $3}'
```

Always rebase onto this branch before creating a PR. If you used
`scripts/new-worktree.sh`, the target is also stored in
`branch.<name>.shapeup-target`:

```bash
git config --get branch.<your-branch>.shapeup-target
```

#### Working Directory

Agents must do all work from inside the worktree directory for the branch
they are currently working on. Do not switch branches or edit files from the
repo root or from a different worktree. This keeps the active branch visible
and prevents accidental changes leaking across branches.

```bash
# Good: work inside the branch's own directory
cd docs/agent-rebase-conventions
# edit, commit, push from here

# Bad: editing from another worktree or the repo root
cd ../_cooldown
# changes here belong to cooldown-3, not your branch
```

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

### Branch Protection

The following branches are protected on GitHub and **must be updated through pull requests** — direct pushes are rejected:

- `main`
- `cycle-*`
- `cooldown-*`

These branches also require status checks to pass before merging. For release work, open a PR from a release branch; do not attempt to push release commits or tags directly.

### Merge Strategy

- **Bet → Cycle**: Merge commit with descriptive message
- **Cycle → Main**: Always merge commit, tag with `v1.{cycle}.0`
- **Hotfixes**: Create bugfix/ branch, merge to main, then merge to current cycle

### Git Best Practices

**Never change the remote URL protocol.** The repository uses SSH (`git@github.com:...`) by default.

If SSH authentication fails:
1. Do NOT change the remote to HTTPS
2. Credentials may not have been approved. SSH key may be in a password manager.


### Worktree Workflow for Issue Addressing

Git worktrees let you check out multiple branches simultaneously in separate
directories. This is the recommended workflow when addressing GitHub issues,
especially for agentic coding agents.

#### Benefits

- **Isolation** — Each issue has its own working directory. No risk of leftover
  changes, staged files, or build artifacts leaking between tasks.
- **Parallel work** — You (or the agent) can work on an issue in one worktree
  while the app runs or tests execute in another.
- **No stashing** — Switch between issues without committing WIP or stashing
  changes. Each worktree is a clean checkout.
- **Independent state** — Each worktree has its own `node_modules`, index, and
  HEAD. Running `bun install` or `bun test` in one worktree doesn't affect others.
- **Shared hooks** — Git hooks in the main repository `.git/hooks/` apply to
  all worktrees automatically (pre-commit, pre-push).

#### Setup Convention

This repository uses a bare repo at the project root with worktrees as
subdirectories:

```bash
tourrankings/                       # Bare repository (.git lives here)
├── _cooldown/                      # (anchor) cooldown branch
├── _cycle/                         # (anchor) cycle branch
├── _main/                          # (anchor) main branch
├── _client/                        # (anchor) a bet
├── _server/                        # (anchor) another bet
├── my-fix/                         # (agent-created) bugfix branch
├── new-feature/                    # (agent-created) bet branch
└── .../
```

**Naming convention:** Anchor worktrees (set up manually) use a `_` prefix.
Agent-created worktrees for issues use plain names without `_`.

To add a new worktree for an issue, create it as a sibling of the current
worktree directory, branching from the current release branch. The
default branch on GitHub (`origin/HEAD`) always points to the current
cycle or cooldown branch, so agents can resolve it programmatically:

```bash
# From any existing worktree (e.g., ../_cooldown/)
git worktree add -b bugfix/my-fix ../my-fix "$(git rev-parse --abbrev-ref origin/HEAD)"
```

This creates `../my-fix/` as a new worktree on a `bugfix/my-fix` branch
based on the current release branch (e.g., `cooldown-3` or `cycle-4`).

#### Agent Workflow

1. **Identify an issue** to address (e.g., a `bug` or `pitch` labelled issue).
2. **Create a worktree** from the current release branch. The default branch
   on GitHub (`origin/HEAD`) always tracks the current cycle or cooldown:
   ```bash
   # From any existing worktree (e.g., ../_cooldown/)
   git worktree add -b bugfix/{description} ../{description} "$(git rev-parse --abbrev-ref origin/HEAD)"
   ```
3. **Change to the worktree directory** and do all work there:
   ```bash
   cd ../{description}
   bun install  # if needed
   ```
4. **Develop, commit, push, create PR** from the worktree.
5. **After merge**, clean up:
   ```bash
   cd ../_cooldown  # or any other worktree
   git worktree remove ../{description}
   git branch -d bugfix/{description}
   ```

#### Lifecycle

```text
Issue → worktree add → develop → commit → push → PR → merge → worktree remove
```

#### Tips

- Run `bun install` once per worktree (each has its own `node_modules`).
- Use `git worktree list` to see all active worktrees.
- Hooks in the main `.git/hooks/` directory apply to all worktrees — no
  duplicate setup needed.
- The default branch on GitHub (`origin/HEAD`) is always set to the current
  cycle or cooldown branch. Use `git rev-parse --abbrev-ref origin/HEAD` to
  resolve it programmatically — no need to guess which release is current.
- Always create worktrees from this branch so the base is up to date.
- After the PR merges, remove the worktree to keep things tidy.


## Project Structure

```
data/           # Race data (csv, html, raw)
public/         # Static assets
scripts/        # Build & workflow scripts
src/
├── client/     # Browser JS (state, feedback)
├── core/       # Cycling domain logic
├── models/     # CSV-backed data models
├── scrappers/  # ProCyclingStats scraper
├── server/     # Express server (controllers, routes, views, middleware)
├── services/   # Data services (CSV, Google Sheets)
└── utils/      # Shared utilities
test/           # Tests (Errors/, scraping/, server/, utils/)
```

**Key entry points:**
- `src/server/index.js` - Server boot
- `src/client/index.js` - Client JS boot
- `src/scrappers/scrape_proCyclingStats.js` - Scraper entry

**Key services:**
- `src/services/dataServiceInstance.js` - Data service singleton
- `src/services/data/dataService.js` - CSV data loading

**Key patterns:**
- CSV-backed models in `src/models/`
- EJS server-side templates in `src/server/views/`

## CI/CD

GitHub Actions runs on PRs and pushes:

1. **Lint & Test** - `bun run lint` and `bun test`
2. **Security Scan** - `bun run audit`
3. **Docker Build** - Test production/dev builds
4. **Deploy** - Fly.io (dev from cycle/cooldown branches, prod from main)

## Creating Shape Up Issues

> "A problem well stated is a problem half solved."  
> — Charles F. Kettering

In this project, "creating an issue" means creating a GitHub issue following the Shape Up methodology from Basecamp. Shape Up distinguishes between **having an idea** and **shaping work**. Most failed bets fail not because of execution, but because the problem was never clearly understood. Resist the urge to jump straight to solutions.

**Reference:** [Basecamp's Shape Up](https://basecamp.com/shapeup) - A methodology for shipping work in 6-week cycles.

### Which Template to Use?

| If you... | Use | Labels |
|-----------|-----|--------|
| Have a vague concept, feeling something is wrong, or see an opportunity but can't articulate it yet | Raw Idea | `raw-idea`, `needs-shaping` |
| Can clearly state the problem AND have a shaped solution approach | Pitch | `pitch`, `needs-betting` |

**Critical:** If you find yourself writing solution details in a Raw Idea, stop. You're shaping prematurely. Move those thoughts to a comment or separate doc, and focus the issue on defining the problem.

### 1. Raw Idea Template

**Use when:** You have a concept but haven't shaped it yet. The problem is fuzzy. You might not even be sure it's worth solving.

**Goal:** Capture the concept so it can be shaped later. Don't try to solve it here.

**Template:**
```markdown
## Current Situation
[What is happening now? Be specific with examples.]

## Pain Point / Opportunity
[What feels wrong or what could be better? Avoid solutions.]

## Context
[Any background that might help when shaping: user feedback, data, constraints]
```

**Example:**
```markdown
## Current Situation
When the scraper finishes updating race results, users don't see the new data 
for up to 75 minutes (scraper runs every 45 min + server refreshes every 30 min).

## Pain Point / Opportunity
During live races, users are looking at stale stage results. The server should 
reflect scraper updates much faster.

## Context
- Scraper writes CSV files after every stage
- Server uses timer-based polling (30 min interval)
- Both run in same container with shared volume
```

### 2. Pitch Template

**Use when:** Work is shaped and ready for betting. You deeply understand the problem AND have a solution approach that fits an appetite.

**Required Fields:**

| Field | Purpose | Good Example | Bad Example |
|-------|---------|--------------|-------------|
| **Appetite** | Time box that forces scope decisions | "Small Batch (1-2 weeks) — can implement file watching with debounce" | "Medium" |
| **Problem Statement** | The specific user pain. it should be undeniable. | "Users wait 75 min for fresh data during live races" | "We need better caching" |
| **Solution (Shaped)** | High-level approach, not detailed specs | "Watch CSV directory, debounce 1 min, reset polling timer" | "Implement fs.watch with recursive option set to true..." |

**Optional Fields:**
- **Rabbit Holes:** What could go wrong or take unexpectedly long?
- **No-Gos:** What are we explicitly NOT doing? (Scope boundaries)

**Template:**
```markdown
## Appetite
Small Batch (1-2 weeks) / Big Batch (4-6 weeks)

## Problem Statement
[One or two sentences that capture the user pain. Include evidence if available.]

## Solution (Shaped)
[High-level approach. Not implementation details.]

## Rabbit Holes
- [What could be harder than expected?]
- [What don't we understand yet?]

## No-Gos
- [What are we NOT doing?]
- [What's out of scope?]
```

### Creating Issues via GitHub CLI

```bash
# Raw Idea
gh issue create --label raw-idea --label needs-shaping --title "Idea: [title]" --body "[description]"

# Pitch (using template)
gh issue create --label pitch --label needs-betting --title "Pitch: [title]" --body-file - <<'EOF'
## Appetite
Small Batch (1-2 weeks)

## Problem Statement
[Describe the problem]

## Solution (Shaped)
[Describe the solution]

## Rabbit Holes
- [Potential pitfalls]

## No-Gos
- [What's out of scope]
EOF
```

### The Path from Idea to Built

```text
Raw Idea → [Shaping] → Pitch → [Betting] → bet/ Branch → [Build] → Merged
     ↑                           ↓
[needs-shaping]           [needs-betting]
     ↓                           ↓
   Shaping Board            Ready for Betting
```

**Key transitions:**
1. **Raw Idea → Pitch:** You understand the problem deeply and have shaped a solution
2. **Pitch → Betting:** Work is selected for the current cycle
3. **Bet → Build:** Development begins on a `bet/` branch

**Circuit Breaker:** If work exceeds appetite, convert bet to `circuit-breaker/` branch. Document what was learned.

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

## GDPR-Safe Development

This project handles personal data and must comply with the General Data Protection Regulation (GDPR). Every agent working on this codebase must follow these rules to ensure all work is GDPR-safe.

### Data Inventory

The project processes the following categories of data:

| Data Category | Source | Storage | GDPR Basis |
|---|---|---|---|
| **Rider personal data** (name, surname, date of birth, nationality) | Scraped from ProCyclingStats (public site) | CSV files in `data/` and `public/data/csv/` | Legitimate interest / public interest — professional sports figures, publicly available |
| **Team data** (team name, classification) | Scraped from ProCyclingStats | CSV files | No personal data involved |
| **Race results** (rankings, times, points, UCI points) | Scraped from ProCyclingStats | CSV files | No personal data involved, but rider names appear as incidental context in stage result rows. (The `age` column from PCS HTML is explicitly dropped before CSV persistence.) |
| **Feedback form data** (email, message, user agent, page URL) | User-submitted via client-side form | Google Sheets (third-party processor) | Consent — user explicitly submits with optional email |
| **Server logs** | Application logging (stdout/stderr) | ephemeral (container stdout, not persisted) | Legitimate interest — operational necessity, no PII logged |

### Guiding Principles

1. **Data Minimisation** — Only collect, store, and transmit the minimum data required for the feature to function. If you can achieve the goal without storing a data point, do so.
2. **Purpose Limitation** — Data collected for one purpose (e.g., showing race rankings) must not be repurposed (e.g., profiling users) without explicit consent.
3. **Transparency** — Any collection of personal data must be visible and understandable to the data subject.
4. **Security** — Personal data must be protected against unauthorised access, alteration, or loss.
5. **Accountability** — Every change that touches personal data must be reviewable. Document your GDPR reasoning in PR descriptions.

### Rules for Agents

#### 1. Scraper — Rider Data Handling

- **Only collect publicly available professional sports data.** Rider names, nationalities, dates of birth, and flags are scraped from publicly published start lists and results on ProCyclingStats. This falls under legitimate interest for a sports statistics website.
- **Never scrape personal contact information** (email, phone, address, social media handles) about riders, staff, or anyone else.
- **Never scrape data about non-public individuals** (fans, commenters, etc.).
- **Date of birth** is currently stored in `riders.csv` but is **never read, displayed, or sent to the client** by the application. It should be removed from the CSV schema and the `Riders` model. See the audit in AGENTS.md below for rationale.
- **Do not add new rider fields** without GDPR review. Every new rider data point must be justifiable as necessary for race result context.
- **Staff data** (DS, soigneurs, mechanics) appears in the start list scrape (`ScrapedRaceStartListStaff`). If this data is unused, it must not be persisted. The current code does not write staff data to CSV — maintain this.

#### 2. Feedback Form — PII Handling

- The **email field is explicitly optional** with clear labelling ("Only if you'd like a response"). Maintain this opt-in pattern. Never make email mandatory.
- The form collects `userAgent` and `pageUrl` for debugging context. These are transmitted to the server but are **not displayed publicly**.
- All feedback data is currently sent to **Google Sheets** (a third-party data processor). There is a planned migration to replace Google Sheets with local NDJSON storage, co-located with the new request logging feature. This will eliminate the third-party processor dependency and enable straightforward deletion.
- Feedback data must be **sanitised** on the server before storage (`sanitizeString()` strips `<`, `>`, `javascript:`). Maintain this sanitisation.
- **Validation** (`validateFeedbackData()`) enforces that message length is capped (2000 chars) and email format is checked. Never remove or relax these limits without GDPR review.
- Feedback data is stored indefinitely in both Google Sheets and (eventually) NDJSON. Until the migration is complete, there is **no deletion mechanism** — see GitHub issue for this work.

#### 3. No Tracking or Analytics

- **Never add analytics scripts** (Google Analytics, Mixpanel, Hotjar, etc.) without explicit GDPR-compliant cookie consent and a privacy policy update.
- **Never add third-party tracking pixels, fingerprinting, or session recording.**
- The project uses **jsdelivr CDN** for D3 and other libraries — this is a content delivery function, not tracking. If adding new CDN dependencies, verify they do not inject tracking.
- **No cookies** are set for tracking or analytics. The CSP `formAction: ['self']` directive prevents form data from being exfiltrated to third parties.

#### 4. Logging — No PII in Logs

- Server logs **must never contain** email addresses, IP addresses, full names, or any other personal data.
- The logging helper (`src/utils/logging.js` — `logOut`/`logError`) outputs operational messages only (e.g., "Scraping race X", "Server running on port Y"). The error handler middleware also uses `src/server/utils/logger.js`, but the helpers in `src/utils/logging.js` are the primary tools used across the codebase.
- **Error messages** logged via `logError` should describe the operation that failed, not the user who triggered it or the data they submitted.
- The feedback controller logs `"Failed to process feedback"` — it does **not** log the submitted email or message body. Maintain this.
- **Never log request headers, query strings, or request bodies** that could contain PII.
- `console.warn` and `console.error` are allowed by ESLint. `console.log` triggers a warning — treat this as a GDPR signal that the log line may not have been reviewed for PII.

#### 5. Third-Party Processors

| Processor | Purpose | Data Shared | Safeguards |
|---|---|---|---|
| Google Sheets API (`sheets.googleapis.com`) | Feedback storage (⚠️ planned migration to local NDJSON) | Email (optional), message, user agent, page URL, timestamp | Service account auth (no user impersonation); data is in a private spreadsheet, not publicly accessible |
| jsdelivr CDN (`cdn.jsdelivr.net`) | Serving D3 and other libraries | None (static asset delivery) | No cookies set by CSP; browser cached assets only |
| ProCyclingStats (procyclingstats.com) | Data source for scraping | Public HTTP requests (no user data sent) | Scraper sends no cookies, no authentication, no PII in requests |

- **When adding a new third-party service**, verify:
  1. Is personal data sent to them? If yes, a Data Processing Agreement (DPA) may be needed.
  2. Is the service privacy policy acceptable?
  3. Can the integration be configured to minimise data sharing?

#### 6. User Rights Considerations

- **Access**: If a user requests what data we hold about them, we must be able to respond. Feedback data in Google Sheets is queryable by email. Rider data is purely public sports statistics.
- **Deletion**: If a user requests deletion of their feedback, we must be able to remove their row from Google Sheets. A deletion endpoint or manual process should be documented.
- **Objection**: Users can object to processing. Ensure the feedback form is the only point of personal data collection so this is straightforward.

#### 7. Privacy Notice

- The application **must include a privacy notice** (link in footer or on an accessible page) that explains:
  - What personal data is collected (rider data from public sources, optional feedback email)
  - For what purpose
  - The legal basis (legitimate interest for sports data, consent for feedback email)
  - Third-party processors (Google Sheets, jsdelivr)
  - User rights (access, rectification, deletion, objection)
  - Contact for privacy inquiries
- Any agent adding a new data collection feature must ensure the privacy notice is updated or flagged for update.

#### 8. Auditing Changes for GDPR Impact

When making any change, ask yourself:

| Question | If Yes |
|---|---|
| Does this collect **new personal data**? | Add to data inventory, update privacy notice, confirm legal basis |
| Does this **send personal data** to a new third party? | Verify DPA, update privacy notice |
| Does this **store personal data** in a new location? | Ensure security controls (access control, encryption at rest if sensitive) |
| Does this **display personal data** in the UI? | Ensure it's limited to what's necessary for race context |
| Does this **log personal data**? | Remove the log or redact the PII |
| Does this **add a cookie or tracker**? | Requires GDPR-compliant consent mechanism |

### When in Doubt

- **Default to not collecting.** If you can't justify why a data point is necessary for the feature, don't collect it.
- **Default to not logging.** If you can't guarantee a log line contains zero PII, don't write it.
- **Flag for review.** Add a comment or open a GitHub Discussion if you're unsure about a data handling decision. Privacy is better handled with a second pair of eyes.

## Worktree and branch conventions

This project uses a **bare clone** at `.bare` with `git worktree` to manage
multiple branches side-by-side. Follow these rules when creating branches and
worktrees.

### Quick rules

1. **Never guess the base branch.** The source branch is automatic.
2. **Agents must not create `_`-prefixed worktrees.** Directories starting
   with `_` are reserved for personal task management.
3. **Worktree directory paths mirror branch names exactly.** Branch
   `bet/rider-search` lives in directory `bet/rider-search`.
4. **Always branch from the latest `cycle-*` or `cooldown-*` branch.** The
   highest-numbered integration branch is the source. Cooldown follows cycle,
   so `cooldown-3` is later than `cycle-3`, `cycle-4` is later than
   `cooldown-3`, and so on.
5. **Agents must never create new `cycle-*`, `cooldown-*`, or `main`
   branches.** Those integration branches are created and advanced by the
   project lead only.
6. **The sequence is strict:** `cycle-N` → `cooldown-N` → `cycle-(N+1)` →
   `cooldown-(N+1)` → ... A cooldown branch is only created after its cycle
   is finished; the next cycle is only created after its cooldown is finished.
7. **Integration branches are protected.** Never push directly to
   `cycle-*`, `cooldown-*`, or `main`. Create a feature branch and open a PR.
8. **Set the normal Git upstream to `origin/<branch>`** so `git push` and
   `git pull` work automatically. Record the integration target separately
   in `branch.<branch>.shapeup-target` for tooling.
9. **Do not branch off another feature branch** unless explicitly asked.

### Choosing the base branch

The base branch is **automatic**: the latest `cycle-*` or `cooldown-*` branch
by number. Agents do not choose.

| Source branch | When it is latest |
|---|---|
| `cycle-N` | A new cycle has started and its cooldown has not yet been created. |
| `cooldown-N` | The matching `cycle-N` has finished and cooldown work is ongoing. |

All agent-created branches target this branch. Only the project lead handles
`main` directly.

If the issue does not make the source clear, look at the `_cycle` /
`_cooldown` worktrees or ask before creating anything.

### Branch naming

Use the format `<category>/<short-kebab-description>`:

- `bet/` — Shape Up bet / pitched work
- `bugfix/` — bug fix
- `hotfix/` — urgent production fix
- `feat/` — standalone feature
- `docs/` — documentation
- `deps/` — dependency updates
- `ops/` — CI / infra / deployment
- `test/` — exploratory or test branches
- `spike/` — technical exploration and research
- `circuit-breaker/` — abandoned bet (keep for learning)

### Creating a worktree

Use the helper script instead of running `git worktree` directly:

```bash
./scripts/new-worktree.sh <new-branch>

# Examples
./scripts/new-worktree.sh bet/rider-search
./scripts/new-worktree.sh bugfix/prod-crash
./scripts/new-worktree.sh ops/update-actions
```

This will:

1. Create `<new-branch>` from the latest `cycle-*` / `cooldown-*` branch.
2. Set the normal Git upstream to `origin/<new-branch>` so `git push` and
   `git pull` work automatically.
3. Record the integration branch as `branch.<branch>.shapeup-target` for
   tooling.
4. Create a worktree directory that matches the branch path exactly.

### Rebasing and pull requests

- Rebase onto the same source branch the worktree was created from (the
  latest `cycle-*` or `cooldown-*`).
- Open pull requests against that same branch.
- Only deviate if a human explicitly says so.

Because `new-worktree.sh` records the integration branch in
`branch.<branch>.shapeup-target`, the helper scripts know the correct rebase/PR
target, while the normal Git upstream stays pointed at `origin/<branch>` for
standard push/pull.

### Finishing a worktree

1. Merge the branch into its recorded integration branch (e.g. `cycle-3`).
2. Confirm it shows as merged:
   ```bash
   ./scripts/check-merged-worktrees.sh
   ```
3. Remove the worktree and delete the branch:
   ```bash
   cd .bare
   git worktree remove ../<directory>
   git branch -D <branch>
   git push origin --delete <branch>
   ```

### Existing `_` directories

Directories starting with `_` (e.g. `_client`, `_scrape`, `_main`, `_cycle`)
are part of your personal task-management setup and are intentionally outside
this convention. Agents should leave them alone unless explicitly asked to
work with one.
