#!/bin/bash
# pull-logs.sh - Pulls all NDJSON log files (active + rotated) from Fly.io
# Usage: ./scripts/pull-logs.sh [dev|prod]
# Default: prod

set -e

ENV=${1:-prod}
CONFIG="fly.${ENV}.toml"

if [ ! -f "$CONFIG" ]; then
  echo "Error: $CONFIG not found"
  exit 1
fi

APP_NAME=$(grep "^app = " "$CONFIG" | cut -d"'" -f2)
LOCAL_DIR="./logs"

echo "Pulling logs from $APP_NAME ($ENV)..."

mkdir -p "$LOCAL_DIR"

# List all files on remote
FILES=$(fly ssh console -a "$APP_NAME" --config "$CONFIG" -C "ls /tourRanking/data/logs/" 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "No log files found on remote"
  exit 0
fi

for file in $FILES; do
  fly sftp get -a "$APP_NAME" --config "$CONFIG" "/tourRanking/data/logs/$file" "$LOCAL_DIR/$file" 2>/dev/null
  echo "Pulled $file"
done

echo "Done. Files saved to $LOCAL_DIR/"
