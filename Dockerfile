FROM oven/bun:1 as builder

WORKDIR /tourRanking

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# https://developer.chrome.com/blog/chrome-for-testing
# Install Chrome for Testing with headless shell (lighter than full Chrome)
# Use chrome-headless-shell for lower memory usage
RUN bunx @puppeteer/browsers install chrome-headless-shell@stable && \
    echo "PUPPETEER_EXECUTABLE_PATH=$(find . -type f -name chrome-headless-shell | head -n 1)" >> .env

# Copy application code
COPY . .

# Run build step
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /tourRanking

# Minimal libs for Chrome headless shell (fewer dependencies = less memory)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    libglib2.0-0 \
    libnss3 \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    && rm -rf /var/lib/apt/lists/*  \
    && apt-get clean


# Install Supercronic
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=cd48d45c4b10f3f0bfdd3a57d054cd05ac96812b

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic \
    && apt-get purge -y --auto-remove curl

# Copy from builder stage
COPY --from=builder /tourRanking /tourRanking
COPY crontab crontab

# Expose the port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=256"
ENV PORT=8080
ENV DATA_DIR=/tourRanking/data/csv

RUN mkdir -p /tourRanking/data/csv && \
    chown -R bun:bun /tourRanking/data && \
    chmod -R 755 /tourRanking/data

# Start the application
CMD ["sh", "-c", "bun start"]
