FROM oven/bun:1 as builder

WORKDIR /tourRanking

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy application code
COPY . .

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

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

# Start the application
# CMD ["sh", "-c", "bun start & supercronic /app/crontab"]
CMD ["sh", "-c", "bun start"]
