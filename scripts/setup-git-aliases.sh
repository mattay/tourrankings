#!/usr/bin/env bash
#
# Set up local git aliases for the Shape Up branching workflow.
# Run once per repository (aliases are shared across all worktrees).
#

set -euo pipefail

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: not inside a git repository" >&2
    exit 1
fi

ALIAS_NAME="next-phase"
ALIAS_VALUE='!f() { \
    name=$1; \
    source=${2:-$(git rev-parse --abbrev-ref origin/HEAD | sed "s/^origin\///")}; \
    git fetch origin && \
    git switch -c "$name" "origin/$source" && \
    git push -u origin "$name"; \
}; f'

if git config --local "alias.$ALIAS_NAME" > /dev/null 2>&1; then
    echo "Git alias '$ALIAS_NAME' already exists in this repository."
    echo "Current value: $(git config --local "alias.$ALIAS_NAME")"
    exit 0
fi

git config --local "alias.$ALIAS_NAME" "$ALIAS_VALUE"

echo "Installed git alias '$ALIAS_NAME' in $(git config --local core.repositoryformatversion >/dev/null 2>&1 && git rev-parse --show-toplevel || git rev-parse --git-dir)."
echo ""
echo "Usage:"
echo "  git next-phase cycle-4 cooldown-3"
echo "  git next-phase cycle-4            # uses origin/HEAD"
