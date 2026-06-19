#!/usr/bin/env bash

# Strict mode for safer scripts:
#   -e  Exit immediately if any command fails.
#   -u  Treat unset variables as an error.
#   -o pipefail  If any command in a pipeline fails, the whole pipeline fails.
set -euo pipefail

# Print a list of non-prefixed worktrees whose remote upstream branch has
# been deleted (i.e. squash-merged and cleaned up on origin).
#
# Usage:
#   ./scripts/check-merged-worktrees.sh
#   ./scripts/check-merged-worktrees.sh | xargs -n1 git -C .bare worktree remove

# SCRIPT_DIR = the directory this script lives in.
# $(dirname "$0") gets the script's path, and `cd && pwd` converts it to an
# absolute path (in case it was called as a relative path like ./scripts/...).
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd) || exit 1

# Walk up the directory tree until we find a `.bare` directory.
# This script lives inside the repo, so we need to find the repo root.
ROOT="$SCRIPT_DIR"
while [[ ! -d "$ROOT/.bare" && "$ROOT" != "/" ]]; do
  # dirname removes the last path component, e.g. /a/b/c -> /a/b
  ROOT=$(dirname "$ROOT")
done

if [[ ! -d "$ROOT/.bare" ]]; then
  echo "Error: bare repo '.bare' not found" >&2
  exit 1
fi

# Move to the repo root so all relative paths line up with git's output.
cd "$ROOT" || exit 1

# BARE is the path to the bare Git repository inside the worktree layout.
BARE=".bare"

# Fetch from all remotes and prune deleted remote branches.
# This makes sure Git knows which upstream branches are "[gone]".
# `2>/dev/null` hides any errors, and `|| true` keeps going if fetch fails.
git -C "$BARE" fetch --all -p 2>/dev/null || true

# Read the output of the command inside < <(...) line by line.
# IFS=$'\t' splits each line on tabs into two variables: path and branch.
# The `|| [[ -n "$path" ]]` part handles the last line if it doesn't end
# with a newline (without it the loop might drop the final row).
while IFS=$'\t' read -r path branch || [[ -n "$path" ]]; do

  # Git gives absolute paths like /Users/.../tourrankings/ops/agent-workflow.
  # Strip the repo root so we get the relative worktree directory name.
  # `${path#"$ROOT"/}` removes "$ROOT/" from the start of $path.
  rel="${path#"$ROOT"/}"

  # Git branches are reported as refs/heads/bugfix/foo.
  # Strip refs/heads/ so we get just the branch name, e.g. bugfix/foo.
  b="${branch#refs/heads/}"

  # Skip the bare repo entry (it has no branch).
  [[ "$rel" == ".bare" ]] && continue

  # Skip personal/task-management worktrees that start with "_".
  # These are intentionally kept around even if their remote is gone.
  [[ "$rel" == _* ]] && continue

  # Ask Git for the upstream tracking status of this branch.
  # %(upstream:short) would be something like origin/bugfix/foo.
  # %(upstream:track) is either empty, [ahead N], [behind N], or [gone].
  # We only care about "[gone]", which means the remote branch was deleted.
  track=$(git -C "$BARE" for-each-ref --format='%(upstream:track)' "refs/heads/$b" 2>/dev/null || true)

  # If the upstream is gone, the branch was likely merged on GitHub/GitLab
  # and the remote branch was deleted. Print the worktree directory name.
  [[ "$track" == *gone* ]] && printf '%s\n' "$rel"

# < <(...) is process substitution: it feeds the output of the inner command
# into the while loop as if it were a file. This avoids the subtle problems
# that come from piping into a while loop (like variable scope issues).
done < <(git -C "$BARE" worktree list --porcelain | awk '
  # --porcelain gives machine-readable output with one fact per line.
  # /^worktree / matches lines like:
  #   worktree /Users/.../tourrankings/ops/agent-workflow
  /^worktree / { path=substr($0,10); next }

  # /^branch / matches lines like:
  #   branch refs/heads/ops/agent-workflow
  /^branch /  {
    branch=substr($0,8)
    # Print the path and branch separated by a tab.
    print path "\t" branch
  }
')

# Explicit success exit. The while loop can otherwise return a non-zero code
# when read hits EOF, which would break piping into xargs.
exit 0
