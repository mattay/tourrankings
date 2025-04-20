FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy application code
COPY . .

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app /app

# Expose the port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["bun", "start"]
