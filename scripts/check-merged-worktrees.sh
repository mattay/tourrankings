#!/usr/bin/env bash
set -euo pipefail

# Check which non-prefixed worktrees have already been merged into their
# configured Shape Up integration branch (e.g. cycle-3, cooldown-3, main).
#
# Usage: ./scripts/check-merged-worktrees.sh
# Run from the repository root (the directory containing .bare and worktrees).

cd "${0%/*}/.." || exit 1

BARE=".bare"

if [[ ! -d "$BARE" ]]; then
  echo "Error: bare repo '$BARE' not found in $(pwd)" >&2
  exit 1
fi

echo "Checking non-prefixed worktrees against their configured merge target..."
echo

git -C "$BARE" worktree list --porcelain | awk '
  /^worktree / { path=substr($0,10); next }
  /^branch /  {
    branch=substr($0,8)
    dir=path
    sub(".*/","",dir)
    if (dir !~ /^_/) print dir "\t" branch
  }
' | while IFS=$'\t' read -r dir branch; do
  b="${branch#refs/heads/}"
  target=$(git -C "$BARE" config --get branch."$b".merge 2>/dev/null | sed 's|^refs/heads/||')

  if [[ -z "$target" ]]; then
    printf "%-35s -> %-45s | no target configured | UNKNOWN\n" "$dir" "$b"
  elif [[ "$target" == "$b" ]]; then
    printf "%-35s -> %-45s | self-target          | not merged into integration branch\n" "$dir" "$b"
  elif git -C "$BARE" show-ref --verify --quiet "refs/heads/$target"; then
    if git -C "$BARE" branch --merged "$target" --format='%(refname:short)' | grep -qx "$b"; then
      printf "%-35s -> %-45s | -> %-17s | MERGED\n" "$dir" "$b" "$target"
    else
      printf "%-35s -> %-45s | -> %-17s | NOT MERGED\n" "$dir" "$b" "$target"
    fi
  else
    printf "%-35s -> %-45s | -> %-17s | target branch missing locally\n" "$dir" "$b" "$target"
  fi
done
