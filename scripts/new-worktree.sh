#!/usr/bin/env bash
set -euo pipefail

# Create a new feature worktree following the Shape Up branch convention.
#
# The source branch is always the latest cycle-* or cooldown-* branch.
# Agents do not choose the base branch manually.
#
# The branch's upstream is set to origin/<branch> so push/pull work normally.
# The Shape Up integration target is stored separately in
# branch.<branch>.shapeup-target for tooling.
#
# Usage: ./scripts/new-worktree.sh <new-branch>
#
# Examples:
#   ./scripts/new-worktree.sh bet/rider-search
#   ./scripts/new-worktree.sh bugfix/prod-crash
#   ./scripts/new-worktree.sh ops/update-actions

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd) || exit 1

# Walk up to the repo root (the directory containing .bare)
ROOT="$SCRIPT_DIR"
while [[ ! -d "$ROOT/.bare" && "$ROOT" != "/" ]]; do
  ROOT=$(dirname "$ROOT")
done

if [[ ! -d "$ROOT/.bare" ]]; then
  echo "Error: bare repo '.bare' not found" >&2
  exit 1
fi

cd "$ROOT" || exit 1
BARE=".bare"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <new-branch>" >&2
  exit 1
fi

branch="$1"

# Enforce branch naming convention and prevent agents from creating integration branches
if [[ "$branch" =~ ^(cycle|cooldown|main) ]]; then
  echo "Error: agents must not create '$branch' integration branches" >&2
  exit 1
fi
if [[ ! "$branch" =~ ^(bet|bugfix|feat|docs|deps|ops|test|hotfix|spike|circuit-breaker)/[a-z0-9_-]+$ ]]; then
  echo "Error: branch name must match '<category>/<short-kebab-description>'" >&2
  echo "Allowed categories: bet, bugfix, feat, docs, deps, ops, test, hotfix, spike, circuit-breaker" >&2
  exit 1
fi

# Make sure local cycle/cooldown refs are current before choosing a base.
git -C "$BARE" fetch origin

# Find the latest cycle-* or cooldown-* branch
latest_integration() {
  git -C "$BARE" branch --list 'cycle*' 'cooldown*' --format='%(refname:short)' \
    | grep -E '^(cycle|cooldown)(-[0-9]+)?$' \
    | awk -F- '{
        num = ($2 == "" ? 0 : $2)
        phase = ($1 == "cooldown" ? 1 : 0)
        print num " " phase " " $0
      }' \
    | sort -k1,1n -k2,2n \
    | tail -1 \
    | awk '{print $3}'
}

base=$(latest_integration)

if [[ -z "$base" ]]; then
  echo "Error: no cycle-* or cooldown-* branch exists yet" >&2
  echo "The project lead creates these branches; agents cannot." >&2
  exit 1
fi

if ! git -C "$BARE" show-ref --verify --quiet "refs/heads/$base"; then
  echo "Error: base branch '$base' not found locally" >&2
  exit 1
fi

if [[ "$base" == "$branch" ]]; then
  echo "Error: new branch cannot be the same as the base branch" >&2
  exit 1
fi

# Worktree directory path mirrors the branch name exactly
dir="$branch"

if [[ -e "$dir" ]]; then
  echo "Error: directory '$dir' already exists" >&2
  exit 1
fi

if git -C "$BARE" show-ref --verify --quiet "refs/heads/$branch"; then
  echo "Error: branch '$branch' already exists" >&2
  exit 1
fi

# Create the branch from the integration branch
git -C "$BARE" branch "$branch" "$base"

# Set normal upstream to the branch itself (origin/<branch>) for push/pull
git -C "$BARE" config "branch.$branch.remote" origin
git -C "$BARE" config "branch.$branch.merge" "refs/heads/$branch"

# Remember the Shape Up integration target separately
git -C "$BARE" config "branch.$branch.shapeup-target" "$base"

# Create the remote branch and confirm upstream
git -C "$BARE" push -u origin "$branch"

# Add the worktree at the repo root, creating parent directories if needed
mkdir -p "$(dirname "$dir")"
git -C "$BARE" worktree add "../$dir" "$branch"

echo "Created worktree '$dir' on branch '$branch' from '$base'."

# Setup shared configs and resources in the new worktree
LOCAL_DIR="$ROOT/.local"
WORKTREE_DIR="$ROOT/$dir"

if [ ! -d "$LOCAL_DIR" ]; then
  echo "Warning: .local directory not found, skipping symlink setup" >&2
else
  cd "$WORKTREE_DIR"
  
  # Create data directory if it doesn't exist
  mkdir -p data
  
  # Create symlinks to configs (use -sf to allow re-runs)
  ln -sf "$LOCAL_DIR/.env.local" .
  ln -sf "$LOCAL_DIR/#SECRET_google-service-account-key.json" .
  
  # Create symlinks to data
  ln -sf "$LOCAL_DIR/data/csv" data/
  ln -sf "$LOCAL_DIR/data/html" data/
  
  echo "✓ Worktree setup complete"
fi
