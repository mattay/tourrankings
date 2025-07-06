FROM oven/bun:1 as builder

WORKDIR /tourRanking

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# Install Chrome for Testing - https://developer.chrome.com/blog/chrome-for-testing
RUN bunx @puppeteer/browsers install chrome@stable && \
    echo "PUPPETEER_EXECUTABLE_PATH=$(find . -type f -name chrome | head -n 1)" >> .env

# Copy application code
COPY . .

# Run build step
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /tourRanking

# Required libs for Chrome which is used by Puppeteer
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libdbus-1-3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libexpat1 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


# Install Supercronic
# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=cd48d45c4b10f3f0bfdd3a57d054cd05ac96812b

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

# You might need to change this depending on where your crontab is located

# Copy from builder stage
COPY --from=builder /tourRanking /tourRanking
COPY crontab crontab

# Expose the port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_DIR=/tourRanking/data/csv

RUN mkdir -p /tourRanking/data/csv && \
    chown -R bun:bun /tourRanking/data && \
    chmod -R 755 /tourRanking/data

# Start the application
# CMD ["sh", "-c", "bun start & supercronic /app/crontab"]
CMD ["sh", "-c", "bun start"]
