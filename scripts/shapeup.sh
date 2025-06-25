#!/bin/bash
# scripts/shapeup.sh - Shape Up cycle management

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start-cycle <number>     Start a new 6-week cycle"
    echo "  end-cycle <number>       End current cycle and start cooldown"
    echo "  start-cooldown <number>  Start cooldown period"
    echo "  ship <number>           Ship cooldown to production"
    echo "  status                   Show current cycle status"
    echo "  deploy-dev               Deploy current branch to dev"
    echo ""
    echo "Examples:"
    echo "  $0 start-cycle 1         # Create and switch to cycle-1 branch"
    echo "  $0 end-cycle 1           # Create cooldown-1 from cycle-1"
    echo "  $0 ship 1               # Merge cooldown-1 to main and deploy"
}

get_current_branch() {
    git branch --show-current
}

start_cycle() {
    local cycle_num="$1"
    if [[ -z "$cycle_num" ]]; then
        echo -e "${RED}Error: Cycle number required${NC}"
        exit 1
    fi

    local branch_name="cycle-${cycle_num}"

    echo -e "${BLUE}🚀 Starting Shape Up Cycle ${cycle_num}${NC}"
    echo -e "${YELLOW}Creating branch: ${branch_name}${NC}"

    # Create and switch to cycle branch from main
    git checkout main
    git pull origin main
    git checkout -b "$branch_name"
    git push -u origin "$branch_name"

    echo -e "${GREEN}✅ Cycle ${cycle_num} started!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Start building your feature"
    echo "  2. Push regularly - each push deploys to dev environment"
    echo "  3. Use 'bun run dev' for local development"
    echo "  4. When ready, run: $0 end-cycle ${cycle_num}"
}

end_cycle() {
    local cycle_num="$1"
    if [[ -z "$cycle_num" ]]; then
        echo -e "${RED}Error: Cycle number required${NC}"
        exit 1
    fi

    local cycle_branch="cycle-${cycle_num}"
    local cooldown_branch="cooldown-${cycle_num}"
    local current_branch
    current_branch=$(get_current_branch)

    if [[ "$current_branch" != "$cycle_branch" ]]; then
        echo -e "${RED}Error: Not on ${cycle_branch} branch (currently on ${current_branch})${NC}"
        exit 1
    fi

    echo -e "${BLUE}🏁 Ending Cycle ${cycle_num} and starting Cooldown${NC}"

    # Push final cycle changes
    git add .
    if ! git diff --cached --quiet; then
        git commit -m "End of cycle-${cycle_num}: final changes"
    fi
    git push origin "$cycle_branch"

    # Create cooldown branch
    git checkout -b "$cooldown_branch"
    git push -u origin "$cooldown_branch"

    echo -e "${GREEN}✅ Cooldown ${cycle_num} started!${NC}"
    echo -e "${YELLOW}Cooldown phase (2 weeks):${NC}"
    echo "  1. Bug fixes and polish only"
    echo "  2. Testing and validation"
    echo "  3. Documentation updates"
    echo "  4. When ready: $0 ship ${cycle_num}"
}

start_cooldown() {
    local cycle_num="$1"
    if [[ -z "$cycle_num" ]]; then
        echo -e "${RED}Error: Cycle number required${NC}"
        exit 1
    fi

    local cooldown_branch="cooldown-${cycle_num}"

    echo -e "${BLUE}❄️  Starting Cooldown ${cycle_num}${NC}"

    if git show-ref --verify --quiet "refs/heads/${cooldown_branch}"; then
        git checkout "$cooldown_branch"
        git pull origin "$cooldown_branch"
    else
        git checkout -b "$cooldown_branch"
        git push -u origin "$cooldown_branch"
    fi

    echo -e "${GREEN}✅ Cooldown ${cycle_num} ready!${NC}"
}

ship_to_production() {
    local cycle_num="$1"
    if [[ -z "$cycle_num" ]]; then
        echo -e "${RED}Error: Cycle number required${NC}"
        exit 1
    fi

    local cooldown_branch="cooldown-${cycle_num}"
    local current_branch
    current_branch=$(get_current_branch)

    if [[ "$current_branch" != "$cooldown_branch" ]]; then
        echo -e "${RED}Error: Not on ${cooldown_branch} branch${NC}"
        exit 1
    fi

    echo -e "${BLUE}🚢 Shipping Cycle ${cycle_num} to Production${NC}"

    # Final checks
    echo -e "${YELLOW}Running final checks...${NC}"
    bun test
    bun run lint

    # Push cooldown changes
    git push origin "$cooldown_branch"

    # Merge to main
    git checkout main
    git pull origin main
    git merge --no-ff "$cooldown_branch" -m "Ship cycle-${cycle_num}: $(git log -1 --pretty=%B ${cooldown_branch})"
    git push origin main

    echo -e "${GREEN}✅ Cycle ${cycle_num} shipped to production!${NC}"
    echo -e "${YELLOW}Post-ship cleanup:${NC}"
    echo "  - Production deployment will trigger automatically"
    echo "  - Monitor logs: make logs-prod"
    echo "  - Archive branches when satisfied"
}

show_status() {
    local current_branch
    current_branch=$(get_current_branch)

    echo -e "${BLUE}📊 Shape Up Status${NC}"
    echo -e "${YELLOW}Current branch:${NC} $current_branch"

    if [[ "$current_branch" =~ ^cycle-([0-9]+)$ ]]; then
        local cycle_num="${BASH_REMATCH[1]}"
        echo -e "${GREEN}🔄 Active Cycle: ${cycle_num}${NC}"
        echo "  - Building phase (6 weeks)"
        echo "  - Dev environment: https://tourrankings-dev.fly.dev"
        echo "  - Next: $0 end-cycle ${cycle_num}"
    elif [[ "$current_branch" =~ ^cooldown-([0-9]+)$ ]]; then
        local cycle_num="${BASH_REMATCH[1]}"
        echo -e "${YELLOW}❄️  Cooldown: ${cycle_num}${NC}"
        echo "  - Polish phase (2 weeks)"
        echo "  - Bug fixes and testing only"
        echo "  - Next: $0 ship ${cycle_num}"
    elif [[ "$current_branch" == "main" ]]; then
        echo -e "${GREEN}🏠 On main branch${NC}"
        echo "  - Production environment"
        echo "  - Ready to start new cycle"
    else
        echo -e "${RED}⚠️  Unknown branch pattern${NC}"
    fi

    echo ""
    echo -e "${BLUE}Recent cycle branches:${NC}"
    git branch -r | grep -E "(cycle-|cooldown-)" | head -5 || echo "  No cycle branches found"
}

deploy_dev() {
    local current_branch
    current_branch=$(get_current_branch)

    echo -e "${BLUE}🚀 Deploying ${current_branch} to development${NC}"

    if [[ "$current_branch" =~ ^(cycle-|cooldown-) ]]; then
        git push origin "$current_branch"
        echo -e "${GREEN}✅ Pushed to origin - GitHub Actions will deploy to dev${NC}"
        echo -e "${YELLOW}Development URL:${NC} https://tourrankings-dev.fly.dev"
    else
        echo -e "${RED}Error: Can only deploy cycle-* or cooldown-* branches to dev${NC}"
        exit 1
    fi
}

# Main command processing
case "${1:-}" in
    start-cycle)
        start_cycle "$2"
        ;;
    end-cycle)
        end_cycle "$2"
        ;;
    start-cooldown)
        start_cooldown "$2"
        ;;
    ship)
        ship_to_production "$2"
        ;;
    status)
        show_status
        ;;
    deploy-dev)
        deploy_dev
        ;;
    *)
        print_usage
        exit 1
        ;;
esac
