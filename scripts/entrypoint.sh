#!/bin/sh
set -e

# Entrypoint for the Fly.io container.
#
# Fly mounts the persistent volume over /tourRanking/data at runtime, hiding
# the directories and permissions created in the image. This script runs as
# root briefly to ensure the required subdirectories exist and are writable by
# the app user, then drops privileges and starts cron + the web server.

# Persistent data mount point. This is intentionally NOT named DATA_DIR so it
# does not shadow the DATA_DIR environment variable that the application reads
# (e.g. /tourRanking/data/csv).
DATA_ROOT=/tourRanking/data

mkdir -p "$DATA_ROOT/csv" "$DATA_ROOT/html" "$DATA_ROOT/logs"

# Only chown when the volume is not already owned by bun. As the data set grows,
# a recursive chown on every container start would slow startup and could exceed
# Fly's health-check grace period.
BUN_UID=$(id -u bun)
CSV_OWNER=$(stat -c '%u' "$DATA_ROOT/csv" 2>/dev/null || echo 0)
if [ "$CSV_OWNER" != "$BUN_UID" ]; then
    chown -R bun:bun "$DATA_ROOT"
fi

# Start supercronic and the webserver as the bun user.
# Wait for either process to exit; if one fails, kill the other and propagate
# the exit status so the container is restarted.
exec gosu bun bash -c '
  supercronic -passthrough-logs /tourRanking/crontab &
  cron_pid=$!
  bun start &
  server_pid=$!

  cleanup() {
    kill "$cron_pid" "$server_pid" 2>/dev/null || true
    wait
  }
  trap cleanup TERM INT

  wait -n
  exit_code=$?
  cleanup
  exit $exit_code
'
