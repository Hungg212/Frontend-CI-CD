#!/bin/bash
# Runs ON the EC2 server to (re)deploy the API.
# Used by CI through SSM Run Command, and can be run by hand over SSH.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/coffee/app}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="docker-compose.ec2.yml"

log() { echo "[deploy] $*"; }

if [ ! -d "$APP_DIR/.git" ]; then
  log "ERROR: $APP_DIR is not a git checkout. Run infra/aws/scripts/02-setup-server.ps1 first."
  exit 1
fi

cd "$APP_DIR"

# CI invokes this script through sudo, but the checkout belongs to ec2-user.
# Without this, git refuses to run ("dubious ownership").
git config --global --get-all safe.directory 2>/dev/null | grep -qx "$APP_DIR" \
  || git config --global --add safe.directory "$APP_DIR"

log "Fetching origin/$BRANCH"
git fetch --depth 1 origin "$BRANCH"
git reset --hard "origin/$BRANCH"

if [ ! -f /opt/coffee/.env ]; then
  log "ERROR: /opt/coffee/.env is missing (DB password + JWT secret)."
  exit 1
fi
cp /opt/coffee/.env .env

log "Building and restarting containers"
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

log "Waiting for the API health check"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1/api/health >/dev/null 2>&1; then
    log "API healthy after ${i} attempt(s)"
    docker image prune -f --filter "until=24h" >/dev/null || true
    exit 0
  fi
  sleep 5
done

log "API did not become healthy; last 80 log lines:"
docker compose -f "$COMPOSE_FILE" logs --tail 80 api || true
exit 1
