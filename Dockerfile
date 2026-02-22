# Dockerfile - Production build
# Used by: docker-compose.local-build.yml, fly.dev.toml, fly.prod.toml
# Purpose: Optimized, secure production deployment

FROM oven/bun:1 as builder

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
FROM oven/bun:1-slim

WORKDIR /tourRanking

# ============================================
# Runtime Dependencies (minimal)
# ============================================
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
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
    NODE_OPTIONS="--max-old-space-size=512" \
    PORT=8080 \
    DATA_DIR=/tourRanking/data/csv \
    DATA_AUTO_REFRESH=TRUE

# ============================================
# Security
# ============================================
RUN chown -R bun:bun /tourRanking
USER bun

EXPOSE 8080

# ============================================
# Health Check
# ============================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bun -e 'fetch("http://localhost:8080/health").then(r=>r.ok||process.exit(1))'

# ============================================
# Startup
# ============================================
CMD ["bun", "start"]
