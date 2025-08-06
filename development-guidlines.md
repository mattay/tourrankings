# Development Guidelines

This document outlines the development workflow for this project, based on Shape Up methodology combined with git best practices.

## Branch Naming Conventions

### Production & Integration Branches
- `main` - Production-ready code, deployable at any time
- `cycle-{number}` - 6-week development cycles (e.g., `cycle-1`, `cycle-2`)
- `cooldown-{number}` - 2-week maintenance periods between cycles

### Feature Development
- `bet/{description}` - Shaped work with defined appetite
  - `bet/user-authentication` - Small bet (1-2 weeks)
  - `bet/profile-redesign` - Medium bet (3-4 weeks)
  - `bet/dashboard-overhaul` - Large bet (4-6 weeks)

### Support Branches
- `spike/{description}` - Technical exploration and research
- `bugfix/{description}` - Bug fixes during cooldown periods
- `deps/{description}` - Dependency updates and maintenance
- `security/{description}` - Security patches and updates
- `circuit-breaker/{description}` - Abandoned bets (keep for learning)

### Branch Naming Rules
- Use lowercase with hyphens (kebab-case)
- Be descriptive but concise
- Avoid personal names or initials
- Include ticket/issue numbers when relevant: `bet/user-auth-#123`

## Commit Message Conventions

### Format
```gitcommit
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature or enhancement
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic changes)
- `refactor` - Code refactoring (no functional changes)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates
- `circuit` - Circuit breaker decision (abandoned work)

### Scope (Optional)
- `auth` - Authentication related
- `ui` - User interface changes
- `api` - API changes
- `deps` - Dependencies
- `config` - Configuration changes

### Examples
```gitcommit
feat(auth): add OAuth2 integration with Google

Implement Google OAuth2 login flow with proper error handling
and user profile synchronization.

Closes #45
```

```gitcommit
circuit(social): abandon social login feature

After 2 weeks of exploration, the third-party APIs are too
unreliable and don't meet our appetite constraints.

Appetite: Medium (3 weeks)
Time spent: 2 weeks
Reason: External API reliability issues
```

```gitcommit
chore(deps): update React to 18.2.1

Security patch update, no breaking changes.
```

### Commit Message Guidelines
- First line should be 50 characters or less
- Use imperative mood ("add" not "added" or "adds")
- Capitalize first letter of subject
- No period at end of subject line
- Body should explain what and why, not how
- Reference issues/tickets in footer

## Merging Strategies

### Bet Branches → Cycle Branch
- **Default**: Merge commit with meaningful merge message
- **When to squash**: If branch has many "work in progress" commits
- **Merge message format**: `Merge bet/feature-name: Brief description of completed work`

### Cycle Branch → Main
- **Always**: Merge commit to preserve cycle history
- **Merge message**: `Deploy Cycle {number}: Summary of delivered bets`
- **Tag the merge**: `v{cycle-number}.0` (e.g., `v1.0`, `v2.0`)

### Hotfixes to Main
- **Strategy**: Create `bugfix/` branch, merge to main, then merge back to current cycle
- **Fast-forward**: Only for single-commit fixes

### Circuit Breakers
- **Never delete** the branch - keep for learning
- **Document** the circuit breaker decision in final commit
- **Archive**: Move to `circuit-breaker/` prefix before archiving

## Deployment Strategy

### Environments
- **Production**: Deployed from `main` branch only
- **Development**: Deployed from current `cycle-{number}` branch

### Deployment Process

#### Cycle Deployments (Every 6 weeks)
1. Complete final integration testing on `cycle-{number}` branch
2. Create pull request: `cycle-{number}` → `main`
3. Perform final review and approval
4. Merge to `main` with descriptive merge commit
5. Tag the release: `git tag v{cycle}.0`
6. Deploy to production from `main`
7. Create new `cycle-{number+1}` branch from `main`

#### Hotfix Deployments (As needed)
1. Create `bugfix/` branch from `main`
2. Implement and test fix
3. Create pull request to `main`
4. Deploy to production after merge
5. Merge `main` back to current cycle branch
6. Tag with patch version: `v{cycle}.{patch}`

#### Dependency Updates
- **During cooldown**: Deploy as part of cycle process
- **Security patches**: Follow hotfix process if critical

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Integration testing completed
- [ ] Performance impact assessed
- [ ] Security review (if applicable)
- [ ] Documentation updated
- [ ] Rollback plan prepared

## Shape Up Integration

### Cycle Rhythm
- **6 weeks building**: Active development on shaped bets
- **2 weeks cooldown**: Bug fixes, exploration, dependency updates
- **Betting table**: Planning happens during cooldown for next cycle

### Appetite Management
- **Small bets**: 1-2 weeks, single developer
- **Medium bets**: 3-4 weeks, 1-2 developers
- **Large bets**: 4-6 weeks, small team
- **Circuit breaker**: Stop work if appetite is exceeded

### Branch Lifecycle
1. **Shaping**: Research and define the bet (outside git)
2. **Betting**: Decide which bets to pursue (create branches)
3. **Building**: Daily commits, regular integration
4. **Circuit breaker**: Document and abandon if needed
5. **Integration**: Merge completed work to cycle branch
6. **Deployment**: Deploy cycle to production

## Code Review Guidelines

### Pull Request Requirements
- Clear description of changes and reasoning
- Reference to related issues/tickets
- Self-review completed before requesting review
- Tests added/updated as needed
- Documentation updated if required

### Review Focus Areas
- Does this solve the stated problem?
- Is the approach appropriate for the appetite?
- Are there obvious bugs or edge cases?
- Is the code maintainable?
- Does it follow project conventions?

### Approval Process
- **Bet branches**: Self-merge after basic review (personal project)
- **Cycle → Main**: More thorough review, consider risks
- **Hotfixes**: Quick review focusing on fix and impact

## Tools Integration

### Git-Graph Configuration
- Configured to visualize Shape Up workflow
- Color-coded branch types for easy identification
- Solarized color palette for terminal compatibility

### Code Review
- CodeRabbit.ai integration for automated review
- Focus on learning and improvement
- Document patterns and anti-patterns discovered

---

## Notes for Team Scaling

While this is currently a personal project, these guidelines are designed to scale:

- **Individual**: Focus on discipline and habit formation
- **Small team**: Add pair programming and code review rituals
- **Larger team**: Implement formal betting table process and team coordination

The key is maintaining the Shape Up rhythm while building sustainable development practices.
