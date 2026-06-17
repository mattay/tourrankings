#!/bin/bash
set -e

# Backup the Fly.io data volume to a local tarball.
#
# Usage:
#   scripts/backup-data.sh         # back up production
#   scripts/backup-data.sh dev     # back up development
#
# Requires the Fly.io CLI (flyctl) and access to the app.

ENV=${1:-prod}

case "$ENV" in
  dev)
    CONFIG="fly.dev.toml"
    ;;
  prod)
    CONFIG="fly.prod.toml"
    ;;
  *)
    echo "Usage: $0 [dev|prod]"
    exit 1
    ;;
esac

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTFILE="tourrankings-${ENV}-backup-${TIMESTAMP}.tar.gz"

echo "Backing up /tourRanking/data from ${ENV} to ${OUTFILE}..."
fly ssh console --config "${CONFIG}" -C "tar czf - /tourRanking/data" > "${OUTFILE}"
echo "Backup complete: ${OUTFILE}"
