#!/usr/bin/env bash
# =============================================================================
# Oxubiraz — Emergency Rollback
# Redeploys a previous image SHA without going through CI/CD.
#
# Usage (on the server as deploy user):
#   bash scripts/rollback.sh <sha>
#
# Example:
#   bash scripts/rollback.sh abc1234
# =============================================================================
set -euo pipefail

SHA="${1:-}"
APP_DIR="${APP_DIR:-/opt/oxubiraz}"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.prod.yml"

log()  { echo "$(date '+%H:%M:%S') [INFO] $*"; }
die()  { echo "$(date '+%H:%M:%S') [ERR]  $*" >&2; exit 1; }

[ -n "${SHA}" ] || die "Usage: $0 <git-sha>"
[ -f "${APP_DIR}/.env.prod" ] || die ".env.prod not found in ${APP_DIR}"

cd "${APP_DIR}"
set -a; source .env.prod; set +a

log "Rolling back to SHA: ${SHA}"

# Check images exist locally (pulled by previous deploys)
if ! docker image inspect "${REGISTRY}/api:${SHA}" &>/dev/null; then
  log "Image not cached locally, pulling..."
  docker pull "${REGISTRY}/api:${SHA}"   || die "Could not pull API image ${SHA}"
  docker pull "${REGISTRY}/horizon:${SHA}" || die "Could not pull Horizon image ${SHA}"
  docker pull "${REGISTRY}/web:${SHA}"   || die "Could not pull Web image ${SHA}"
fi

log "Stopping current containers..."
API_TAG="${SHA}" WEB_TAG="${SHA}" ${COMPOSE} up -d --no-deps api web horizon

log "Waiting for API to become healthy..."
for i in $(seq 1 20); do
  if API_TAG="${SHA}" WEB_TAG="${SHA}" \
     ${COMPOSE} exec -T api php -r 'exit(0);' 2>/dev/null; then
    log "API healthy after $((i * 3))s"
    break
  fi
  [ "$i" -lt 20 ] && sleep 3 || die "API did not recover. Investigate manually."
done

log "Rollback to ${SHA} complete."
log "If the issue was a bad migration, connect to MySQL and roll back manually:"
log "  ${COMPOSE} exec -T api php artisan migrate:rollback --step=1"
