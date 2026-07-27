# Branching Workflow for Humans

This is the quick-reference guide for creating and managing Shape Up phase branches (`cycle-*` and `cooldown-*`).

For the full agent conventions, see [`AGENTS.md`](../AGENTS.md).

## TL;DR

```bash
# Create the next cycle or cooldown branch
./scripts/setup-git-aliases.sh        # one-time setup
git next-phase cycle-4 cooldown-3     # create and push cycle-4 from cooldown-3
```

## Shape Up branches

| Branch | Purpose | Created by |
|---|---|---|
| `main` | Production code | Project lead only |
| `cycle-{n}` | 6-week build phase | Project lead only |
| `cooldown-{n}` | 2-week cooldown/maintenance | Project lead only |
| `bet/{name}` | Shaped work | Anyone |
| `bugfix/{name}` | Bug fixes | Anyone |

## Creating a new phase branch

### 1. Install the alias (one-time)

```bash
./scripts/setup-git-aliases.sh
```

This adds a `next-phase` alias to the local repository’s Git config.

### 2. Create and push the branch

```bash
# explicit source
git next-phase cycle-4 cooldown-3

# or use the default origin/HEAD
git next-phase cycle-4
```

This is equivalent to:

```bash
git fetch origin
git switch -c cycle-4 origin/cooldown-3
git push -u origin cycle-4
```

## Important: repository rules

The GitHub branch protection rules for `cycle-*` / `cooldown-*` must **allow merge commits**. These branches are created from previous phase branches that already contain merge commits, and `cycle-{n} → main` releases are intentionally done as merge commits.

If you see:

```text
remote: error: GH013: Repository rule violations found for refs/heads/cycle-4.
remote: - This branch must not contain merge commits.
```

The fix is in GitHub Settings → Branches → Branch protection rules:

- Uncheck **"Require linear history"** for `cycle-*`, `cooldown-*`, and `main`.
- Keep **"Require a pull request before merging"** and status checks enabled.

## Worktrees

This project uses bare clone + worktrees. To start work on a new bet or bugfix, use the helper:

```bash
./scripts/new-worktree.sh bet/my-feature
```

This creates a matching worktree directory and branch from the current `cycle-*` or `cooldown-*` branch.

## See also

- [`AGENTS.md`](../AGENTS.md) — full agent/worktree/branch conventions
- [`scripts/new-worktree.sh`](../scripts/new-worktree.sh) — create a bet/bugfix worktree
- [`scripts/check-merged-worktrees.sh`](../scripts/check-merged-worktrees.sh) — clean up finished worktrees
