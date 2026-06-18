#!/usr/bin/env bash
set -euo pipefail

# Check which non-prefixed worktrees have already been merged into their
# recorded Shape Up integration branch (e.g. cycle-3, cooldown-3).
#
# Usage: ./scripts/check-merged-worktrees.sh
# Can be run from any worktree or the repository root.

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

echo "Checking non-prefixed worktrees against their Shape Up target..."
echo

git -C "$BARE" worktree list --porcelain | awk '
  /^worktree / { path=substr($0,10); next }
  /^branch /  {
    branch=substr($0,8)
    print path "\t" branch
  }
' | while IFS=$'\t' read -r path branch; do
  rel="${path#$ROOT/}"
  b="${branch#refs/heads/}"

  # Skip personal task-management worktrees (prefixed with _)
  [[ "$rel" == _* ]] && continue

  target=$(git -C "$BARE" config --get branch."$b".shapeup-target 2>/dev/null)

  if [[ -z "$target" ]]; then
    printf "%-45s -> %-45s | no Shape Up target configured | UNKNOWN\n" "$rel" "$b"
  elif git -C "$BARE" show-ref --verify --quiet "refs/heads/$target"; then
    if git -C "$BARE" branch --merged "$target" --format='%(refname:short)' | grep -qx "$b"; then
      printf "%-45s -> %-45s | -> %-17s | MERGED\n" "$rel" "$b" "$target"
    else
      printf "%-45s -> %-45s | -> %-17s | NOT MERGED\n" "$rel" "$b" "$target"
    fi
  else
    printf "%-45s -> %-45s | -> %-17s | target branch missing locally\n" "$rel" "$b" "$target"
  fi
done
