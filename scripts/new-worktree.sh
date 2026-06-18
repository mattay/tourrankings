#!/usr/bin/env bash
set -euo pipefail

# Create a new feature worktree following the Shape Up branch convention.
#
# The source branch is always the latest cycle-* or cooldown-* branch.
# Agents do not choose the base branch manually.
#
# Usage: ./scripts/new-worktree.sh <new-branch>
#
# Examples:
#   ./scripts/new-worktree.sh bet/rider-search
#   ./scripts/new-worktree.sh bugfix/prod-crash
#   ./scripts/new-worktree.sh ops/update-actions

cd "${0%/*}/.." || exit 1

BARE=".bare"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <new-branch>" >&2
  exit 1
fi

branch="$1"

if [[ ! -d "$BARE" ]]; then
  echo "Error: bare repo '$BARE' not found in $(pwd)" >&2
  exit 1
fi

# Enforce branch naming convention and prevent agents from creating integration branches
if [[ "$branch" =~ ^(cycle|cooldown|main) ]]; then
  echo "Error: agents must not create '$branch' integration branches" >&2
  exit 1
fi
if [[ ! "$branch" =~ ^(bet|bugfix|feat|docs|deps|ops|test|hotfix)/[a-z0-9_-]+$ ]]; then
  echo "Error: branch name must match '<category>/<short-kebab-description>'" >&2
  echo "Allowed categories: bet, bugfix, feat, docs, deps, ops, test, hotfix" >&2
  exit 1
fi

# Find the latest cycle-* or cooldown-* branch.
# Sort by numeric suffix first; for the same number cooldown is later than cycle.
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

# Worktree directory mirrors the branch name, with / replaced by -
dir="${branch//\//-}"

if [[ -e "$dir" ]]; then
  echo "Error: directory '$dir' already exists" >&2
  exit 1
fi

if git -C "$BARE" show-ref --verify --quiet "refs/heads/$branch"; then
  echo "Error: branch '$branch' already exists" >&2
  exit 1
fi

# Create the branch from the integration branch and record the target
git -C "$BARE" branch "$branch" "$base"
git -C "$BARE" config "branch.$branch.remote" origin
git -C "$BARE" config "branch.$branch.merge" "refs/heads/$base"

# Add the worktree at the repo root
git -C "$BARE" worktree add "../$dir" "$branch"

echo "Created worktree '$dir' on branch '$branch' from '$base'."
