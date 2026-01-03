# Dockerfile - Production build
# Used by: docker-compose.local-build.yml, fly.dev.toml, fly.prod.toml
# Purpose: Optimized, secure production deployment

FROM oven/bun:1 as builder

WORKDIR /tourRanking

# ============================================
# Chrome Headless Shell
# ============================================
ARG CHROME_VERSION=142
RUN bunx @puppeteer/browsers install chrome-headless-shell@${CHROME_VERSION}

RUN CHROME_PATH=$(find /tourRanking -type f -name "chrome-headless-shell" 2>/dev/null | head -n 1) \
    && if [ -z "$CHROME_PATH" ]; then echo "ERROR: Chrome not found"; exit 1; fi \
    && echo "export PUPPETEER_EXECUTABLE_PATH=$CHROME_PATH" > /tourRanking/chrome-path.sh \
    && chmod +x /tourRanking/chrome-path.sh \
    && echo "Chrome installed at: $CHROME_PATH"

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
    libasound2 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgbm1 \
    libgdk-pixbuf-xlib-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libpangocairo-1.0-0 \
    libxrandr2 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ============================================
# Copy from Builder
# ============================================
COPY --from=builder /tourRanking/supercronic-linux-amd64 /usr/local/bin/supercronic
COPY --from=builder /tourRanking/chrome-path.sh /chrome-path.sh
COPY --from=builder /tourRanking /tourRanking
COPY crontab crontab

# ============================================
# Environment
# ============================================
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    PORT=8080 \
    DATA_DIR=/tourRanking/data/csv \
    DATA_AUTO_REFRESH=TRUE \
    PUPPETEER_HEADLESS=TRUE

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
ENTRYPOINT ["/bin/sh", "-c", ". /chrome-path.sh && exec \"$@\"", "--"]
CMD ["bun", "start"]
