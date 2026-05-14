#!/usr/bin/env bash
# =============================================================================
# Oxubiraz — First Deploy
# Run once on the server after server-setup.sh to initialise the stack.
# Subsequent deploys are handled automatically by the CD workflow.
#
# Usage (as deploy user):
#   cd /opt/oxubiraz
#   bash scripts/first-deploy.sh
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/oxubiraz}"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.prod.yml"

log()  { echo "$(date '+%H:%M:%S') [INFO] $*"; }
die()  { echo "$(date '+%H:%M:%S') [ERR]  $*" >&2; exit 1; }

[ -f "${APP_DIR}/.env.prod" ]              || die ".env.prod not found in ${APP_DIR}. Copy .env.prod.example and fill in values."
[ -f "${APP_DIR}/docker-compose.prod.yml" ] || die "docker-compose.prod.yml not found in ${APP_DIR}."

cd "${APP_DIR}"

# Export env so docker compose can read REGISTRY / MYSQL vars
set -a; source .env.prod; set +a

log "Pulling latest images..."
${COMPOSE} pull

log "Starting database and redis first (so migrations can run)..."
${COMPOSE} up -d mysql redis
log "Waiting 30s for MySQL to initialise..."
sleep 30

log "Starting API container..."
${COMPOSE} up -d api

log "Waiting for API health check..."
for i in $(seq 1 20); do
  if docker compose -f docker-compose.prod.yml exec -T api php -r 'exit(0);' 2>/dev/null; then
    log "API is healthy after $((i * 3))s"
    break
  fi
  if [ "$i" -eq 20 ]; then
    die "API did not become healthy in 60s. Check: ${COMPOSE} logs api"
  fi
  sleep 3
done

log "Running migrations..."
${COMPOSE} exec -T api php artisan migrate --force

log "Seeding required data (roles, permissions, system strings)..."
${COMPOSE} exec -T api php artisan db:seed --class=RolePermissionSeeder --force
${COMPOSE} exec -T api php artisan db:seed --class=SystemStringSeeder --force

log "Caching config, routes, views..."
${COMPOSE} exec -T api php artisan optimize

log "Starting remaining services..."
${COMPOSE} up -d

log ""
log "=== First deploy complete ==="
log ""
log "Run 'make vapid' (or the equivalent docker exec command) to generate VAPID keys,"
log "then add them to .env.prod and restart: ${COMPOSE} restart api horizon"
log ""
log "Access Horizon at: https://api.oxubiraz.az/horizon"
log ""
