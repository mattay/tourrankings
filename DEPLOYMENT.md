# Deployment Guide

This project uses a three-tier deployment strategy for different stages of development and testing.

## Quick Reference

| Environment | Command | Purpose | Code Updates |
|-------------|---------|---------|--------------|
| **Local Dev** | `docker compose -f docker-compose.local.yml up` | Daily coding | Instant (hot reload) |
| **Local Test** | `docker compose -f docker-compose.test.yml up --build` | Test production build | Requires rebuild |
| **Fly.io Dev** | `fly deploy --config fly.dev.toml` | Cloud testing | Requires redeploy |
| **Fly.io Prod** | `fly deploy --config fly.prod.toml` | Production | Requires redeploy |

## 1. Local Development (Hot Reload)

**When to use**: Writing and testing code locally

**Setup**:
```bash
docker compose -f docker-compose.local.yml up
```

**Features**:
- Instant code changes (hot reload via Bun)
- Full development dependencies available
- Debug logging enabled
- Source code mounted from host filesystem

**Workflow**:
1. Start the container once
2. Edit files in your editor
3. Changes reflect immediately at http://localhost:8080
4. No need to restart container for code changes

**Stopping**:
```bash
docker compose -f docker-compose.local.yml down
```

## 2. Local Build Testing

**When to use**: Before deploying to Fly.io, testing Dockerfile changes

**Setup**:
```bash
# Build and start
docker compose -f docker-compose.test.yml up --build

# Or rebuild without cache
docker compose -f docker-compose.test.yml build --no-cache
docker compose -f docker-compose.test.yml up
```

**Features**:
- Uses production Dockerfile
- Tests multi-stage builds
- Validates JSDOM + native fetch setup
- Tests with production dependencies only
- Simulates Fly.io environment locally

**Workflow**:
1. Make changes to Dockerfile or build process
2. Run build test to verify it works
3. If successful, deploy to Fly.io
4. Code changes require full rebuild

**Stopping**:
```bash
docker compose -f docker-compose.test.yml down
```

## 3. Fly.io Development Environment

**When to use**: Testing in cloud environment, sharing work with others

**Initial Setup**:
```bash
# Create the app (first time only)
fly apps create tourrankings-dev

# Create volume (first time only)
fly volumes create dev_data_volume --size 1 --region syd --app tourrankings-dev
```

**Deploy**:
```bash
fly deploy --config fly.dev.toml
```

**Features**:
- Production-like infrastructure
- Real network conditions
- Persistent data volume
- Auto-suspend when idle
- Debug logging enabled
- Faster scrape intervals (15 min)

**Access**:
```bash
# View logs
fly logs --config fly.dev.toml

# SSH into machine
fly ssh console --config fly.dev.toml

# Check status
fly status --config fly.dev.toml
```

## 4. Production Deployment

**When to use**: Deploying to live users

**Initial Setup**:
```bash
# Create the app (first time only)
fly apps create tourrankings

# Create volume (first time only)
fly volumes create data_volume --size 1 --region syd --app tourrankings
```

**Deploy**:
```bash
# Deploy from main branch only (per development-guidelines.md)
git checkout main
fly deploy --config fly.prod.toml

# Tag the release (major stays 1; cycle is the minor version)
git tag v1.{cycle}.{patch}
git push origin v1.{cycle}.{patch}
```

**Features**:
- Optimized for performance
- Production logging
- Standard scrape intervals (30 min)
- Auto-scaling enabled
- HTTPS enforced

## Troubleshooting

### Hot Reload Not Working (Local Dev)
- Ensure you're using `docker-compose.local.yml`
- Check that volumes are mounted correctly
- Verify files are being saved in your editor

### Build Failures (Local Test / Fly.io)
```bash
# Test build locally first
docker compose -f docker-compose.test.yml build --no-cache

```

### Memory Issues
- If seeing OOM errors, check memory usage: `fly ssh console --config fly.prod.toml -C "free -m"`

### Data Persistence
- Local: Data stored in `./data` directory
- Fly.io: Data stored in volumes
- Volumes must be created before first deploy

### Backups
Before major changes or releases, back up the Fly.io data volume:

```bash
# Production backup
scripts/backup-data.sh

# Development backup
scripts/backup-data.sh dev
```

This produces a timestamped tarball (`tourrankings-<env>-backup-<timestamp>.tar.gz`) containing `/tourRanking/data`.

## Deployment Checklist

### Before Deploying to Fly.io Dev
- [ ] Test locally with `docker-compose.test.yml`
- [ ] Verify build completes successfully
- [ ] Check health endpoint responds

### Before Deploying to Production
- [ ] All tests passing
- [ ] Code reviewed and merged to `main`
- [ ] Tested on Fly.io dev environment
- [ ] Performance impact assessed
- [ ] Rollback plan prepared
- [ ] Create git tag after successful deploy

## Environment Variables

### Configurable via fly.toml
- `NODE_ENV`: development | production
- `LOG_LEVEL`: debug | info | warn | error
- `DATA_AUTO_REFRESH_INTERVAL`: Milliseconds between scrapes

### Set in Dockerfile (rarely changed)
- `NODE_OPTIONS`: Memory allocation
- `PORT`: Server port (8080)
- `DATA_DIR`: CSV storage location

## Cost Optimization

**Fly.io charges** when machines are running:
- Dev: Auto-suspends when idle (minimal cost)
- Prod: Can set `min_machines_running = 0` to suspend when idle
- Both wake up instantly on first request

**To minimize costs during development**:
```bash
# Stop dev environment when not needed
fly machine stop --config fly.dev.toml

# Start when needed
fly machine start --config fly.dev.toml
```
