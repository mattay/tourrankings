#!/bin/sh
set -e

# Entrypoint for the Fly.io container.
#
# Fly mounts the persistent volume over /tourRanking/data at runtime, hiding
# the directories and permissions created in the image. This script runs as
# root briefly to ensure the required subdirectories exist and are writable by
# the app user, then drops privileges and starts cron + the web server.

DATA_DIR=/tourRanking/data

mkdir -p "$DATA_DIR/csv" "$DATA_DIR/html" "$DATA_DIR/logs"
chown -R bun:bun "$DATA_DIR"

# Start supercronic and the webserver as the bun user.
exec gosu bun sh -c 'supercronic -passthrough-logs /tourRanking/crontab & exec bun start'
