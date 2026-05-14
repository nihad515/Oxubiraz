#!/usr/bin/env bash
# =============================================================================
# Oxubiraz — Production Server Setup
# Run once on a fresh Ubuntu 22.04 LTS server as root or with sudo.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/your-org/oxubiraz/main/scripts/server-setup.sh | sudo bash
#   — or —
#   sudo bash scripts/server-setup.sh
# =============================================================================
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/opt/oxubiraz"
SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"

log()  { echo "$(date '+%H:%M:%S') [INFO] $*"; }
warn() { echo "$(date '+%H:%M:%S') [WARN] $*" >&2; }
die()  { echo "$(date '+%H:%M:%S') [ERR]  $*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root (sudo $0)"

log "=== Oxubiraz server provisioning starting ==="

# ─── System update ────────────────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

# ─── Essential packages ───────────────────────────────────────────────────────
log "Installing essential packages..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  ca-certificates curl gnupg lsb-release \
  ufw fail2ban unattended-upgrades \
  git htop ncdu jq netcat-openbsd \
  logrotate cron

# ─── Swap ─────────────────────────────────────────────────────────────────────
if [ ! -f /swapfile ]; then
  log "Creating ${SWAP_SIZE_GB}GB swap file..."
  fallocate -l "${SWAP_SIZE_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

# ─── Docker ───────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  log "Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
     https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
else
  log "Docker already installed: $(docker --version)"
fi

# ─── Deploy user ──────────────────────────────────────────────────────────────
if ! id "${DEPLOY_USER}" &>/dev/null; then
  log "Creating deploy user '${DEPLOY_USER}'..."
  useradd -m -s /bin/bash "${DEPLOY_USER}"
fi
usermod -aG docker "${DEPLOY_USER}"

# SSH key for GitHub Actions deploy
DEPLOY_SSH_DIR="/home/${DEPLOY_USER}/.ssh"
if [ ! -f "${DEPLOY_SSH_DIR}/authorized_keys" ]; then
  mkdir -p "${DEPLOY_SSH_DIR}"
  touch "${DEPLOY_SSH_DIR}/authorized_keys"
  chmod 700 "${DEPLOY_SSH_DIR}"
  chmod 600 "${DEPLOY_SSH_DIR}/authorized_keys"
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_SSH_DIR}"
  warn "Add your GitHub Actions SSH public key to: ${DEPLOY_SSH_DIR}/authorized_keys"
fi

# ─── App directory ────────────────────────────────────────────────────────────
log "Creating app directory ${APP_DIR}..."
mkdir -p "${APP_DIR}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

# ─── Firewall (UFW) ───────────────────────────────────────────────────────────
log "Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'
ufw --force enable
ufw status verbose

# ─── Fail2ban ─────────────────────────────────────────────────────────────────
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<'FAIL2BAN'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled  = true
port     = ssh
logpath  = /var/log/auth.log
FAIL2BAN
systemctl enable --now fail2ban

# ─── Unattended security upgrades ─────────────────────────────────────────────
log "Enabling unattended security upgrades..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'APT'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
APT

# ─── Log rotation for Docker ──────────────────────────────────────────────────
cat > /etc/docker/daemon.json <<'DOCKERD'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  }
}
DOCKERD
systemctl reload docker || systemctl restart docker

# ─── Done ─────────────────────────────────────────────────────────────────────
log ""
log "=== Server provisioning complete ==="
log ""
log "Next steps:"
log "  1. Add GitHub Actions SSH public key to: ${DEPLOY_SSH_DIR}/authorized_keys"
log "  2. Copy .env.prod.example to ${APP_DIR}/.env.prod and fill in all values"
log "  3. Copy docker-compose.prod.yml and docker/ directory to ${APP_DIR}/"
log "  4. Set GitHub repo secrets:"
log "       DEPLOY_HOST, DEPLOY_USER=${DEPLOY_USER}, DEPLOY_SSH_KEY"
log "       NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL"
log "       NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER"
log "       SLACK_WEBHOOK_URL"
log "  5. Push to main branch — CI passes → CD deploys automatically"
log ""
