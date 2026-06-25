# Dockerfile - Production build
# Used by: docker-compose.local-build.yml, fly.dev.toml, fly.prod.toml
# Purpose: Optimized, secure production deployment

# Pinned 2026-06-17. Update only after building and testing locally.
FROM oven/bun:1@sha256:e10577f0db68676a7024391c6e5cb4b879ebd17188ab750cf10024a6d700e5c4 AS builder

WORKDIR /tourRanking

# ============================================
# Supercronic (cron for containers)
# ============================================
ARG SUPERCRONIC_VERSION=v0.2.34
ARG SUPERCRONIC_SHA1SUM=e8631edc1775000d119b70fd40339a7238eece14
RUN apt-get update && apt-get install -y curl \
    && curl -fsSLO "https://github.com/aptible/supercronic/releases/download/${SUPERCRONIC_VERSION}/supercronic-linux-amd64" \
    && echo "${SUPERCRONIC_SHA1SUM}  supercronic-linux-amd64" | sha1sum -c - \
    && chmod +x supercronic-linux-amd64

# ============================================
# Dependencies (production only)
# ============================================
COPY package.json bun.lock ./
RUN bun install --production

# ============================================
# Application Code & Build
# ============================================
COPY . .
RUN bun run build

# ============================================
# Production Stage
# ============================================
FROM oven/bun:1-slim@sha256:d56a2534ffd262e92c12fd3249d3924d296d97086da773f821d7d0477435ea04

WORKDIR /tourRanking

# ============================================
# Runtime Dependencies (minimal)
# ============================================
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    procps \
    gosu \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ============================================
# Copy from Builder
# ============================================
COPY --from=builder /tourRanking/supercronic-linux-amd64 /usr/local/bin/supercronic
COPY --from=builder /tourRanking /tourRanking

# ============================================
# Environment
# ============================================
ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/tourRanking/data/csv \
    LOG_DIR=/tourRanking/data/logs \
    FILE_LOGGING_ENABLED=true

# ============================================
# Setup
# ============================================
RUN mkdir -p /tourRanking/data/csv /tourRanking/data/html /tourRanking/data/logs && \
    chown -R bun:bun /tourRanking/data && \
    chmod -R 755 /tourRanking/data

# ============================================
# Security
# ============================================
RUN chown -R bun:bun /tourRanking

# Root-owned entrypoint so it can fix mounted volume permissions before
# dropping privileges for the application processes.
COPY --chown=root:root scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

# ============================================
# Health Check
# ============================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bun -e 'fetch("http://localhost:8080/health").then(r=>r.ok||process.exit(1))'

# ============================================
# Startup
# ============================================
# Container starts as root; entrypoint fixes data volume ownership then drops to bun.
CMD ["/usr/local/bin/entrypoint.sh"]
