#!/bin/bash
# setup-worktree.sh - Setup shared configs and resources for a worktree
set -euo pipefail

# Ensure we're in a worktree directory
if [ ! -f ".git" ]; then
  echo "Error: Must be run from inside a git worktree" >&2
  exit 1
fi

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOCAL_DIR="$REPO_ROOT/.local"

if [ ! -d "$LOCAL_DIR" ]; then
  echo "Error: .local directory not found at $LOCAL_DIR" >&2
  exit 1
fi

# Create data directory if it doesn't exist
mkdir -p data

# Create symlinks to configs (use -sf to allow re-runs)
ln -sf "$LOCAL_DIR/.env.local" .
ln -sf "$LOCAL_DIR/#SECRET_google-service-account-key.json" .

# Create symlinks to data
ln -sf "$LOCAL_DIR/data/csv" data/
ln -sf "$LOCAL_DIR/data/html" data/

echo "✓ Worktree setup complete"
