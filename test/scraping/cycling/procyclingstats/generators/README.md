# Fixture Generation System

Generate test fixtures from ProCyclingStats HTML using the same parsers as the scraper.

## Quick Start

```bash
# Generate stage results (top 10 by default)
make results NAME=tdu-2025-stage-1 URL=https://www.procyclingstats.com/race/tour-down-under/2025/stage-1

# Generate with custom filter
make results NAME=tdu-stage-1-top3 FILTER='{"ranks":[1,2,3]}'

# Generate classifications (all 5 types)
make classifications NAME=tdu-2025-stage-1 URL=<url>

# Generate startlist (teams, riders, raceRiders)
make startlists NAME=tdu-2025-startlist URL=<url>
```

## Available Commands

| Command | Purpose | Default Filter |
|---------|---------|----------------|
| `make races` | Race calendar | None (full) |
| `make stages` | Race stages | None (full) |
| `make results` | Stage results | Top 10 by rank |
| `make classifications` | All 5 classifications | Top 10 by rank |
| `make startlists` | Teams/Riders/RaceRiders | 5 team sample |

## Filter Syntax

Filters use JSON with OR logic:

```bash
# By rank
FILTER='{"ranks":[1,2,3,4,5]}'

# By bib number  
FILTER='{"bibs":[81,133,193]}'

# By team
FILTER='{"teams":["Red Bull - BORA","Visma"]}'

# Sample size (after filtering)
FILTER='{"ranks":[1,2,3],"sample":10}'

# Include winner + random sample
FILTER='{"includeWinner":true,"sample":5}'

# No filter (full extract)
FILTER='{}'
```

## Output Structure

Each generation creates:

```
fixtures/{name}/
├── {name}.html       # Cleaned HTML (removed styles/scripts)
├── {name}.json       # Extracted & filtered data
└── {name}.csv        # Model-generated CSV
```

## How It Works

1. **Fetch HTML** from URL or read local file
2. **Clean HTML** - remove `<style>`, `<script>`, inline styles
3. **Parse** using same parsers as scraper (`src/scrappers/source/proCyclingStats/`)
4. **Filter** data using OR logic (matches ANY criteria)
5. **Sample** to limit size if specified
6. **Write fixtures** - HTML, JSON, and CSV via models

## Requirements

- Bun runtime
- Make
- Internet connection (if using --url)

## Notes

- Parsers currently return `[]` (stub implementation)
- Full functionality when `de-puppetter-races` branch implements parsers
- Filters help create manageable test fixtures from large race data
