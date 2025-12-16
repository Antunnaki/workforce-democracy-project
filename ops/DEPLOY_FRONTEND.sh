#!/usr/bin/env bash
# Workforce Democracy Project — Frontend Deployment Script (VPS)
# Purpose: Safely deploy updated frontend files (privacy-first onboarding, etc.) to the VPS
# Author: Junie (automation)
# Date: 2025-12-14

set -euo pipefail

# =============================
# Usage
# =============================
# Export or pass the following environment variables before running:
#   USER        – SSH user on the VPS (e.g., deploy)
#   HOST        – VPS host or IP (e.g., 185.193.126.13)
#   SSH_KEY     – Path to SSH private key (e.g., ~/.ssh/id_ed25519_njalla)
#   DOMAIN      – Primary domain being deployed (e.g., workforcedemocracyproject.org)
#   DOCROOT     – Remote document root (default: /var/www/workforcedemocracyproject.org)
#   FILES       – Space-separated list of files/dirs to include in the package
#                 Default focuses on the privacy-first onboarding changes:
#                 "index.html js/personalization-ui.js js/personalization-system.js"
# Optional flags:
#   BACKUP_DIR  – Remote backup dir (default: /var/backups)
#   VERIFY      – If set to 1, run basic HTTP(S) checks after deploy
#
# Example:
#   USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org \
#   ./ops/DEPLOY_FRONTEND.sh
#
# Example (full sync of core assets):
#   FILES="index.html js css images sw.js manifest.json" \
#   USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org \
#   ./ops/DEPLOY_FRONTEND.sh

USER=${USER:-}
HOST=${HOST:-}
SSH_KEY=${SSH_KEY:-}
DOMAIN=${DOMAIN:-workforcedemocracyproject.org}
DOCROOT=${DOCROOT:-/var/www/workforcedemocracyproject.org}
BACKUP_DIR=${BACKUP_DIR:-/var/backups}
FILES=${FILES:-"index.html js/personalization-ui.js js/personalization-system.js"}
VERIFY=${VERIFY:-0}

if [[ -z "$USER" || -z "$HOST" || -z "$SSH_KEY" ]]; then
  echo "❌ Missing required env vars. Please set USER, HOST, SSH_KEY (and optionally DOMAIN, DOCROOT, FILES)."
  exit 1
fi

if [[ ! -f "$SSH_KEY" ]]; then
  echo "❌ SSH key not found at: $SSH_KEY"
  exit 1
fi

echo "🌐 Deploying frontend to https://$DOMAIN"
echo "👤 $USER@$HOST — docroot: $DOCROOT"
echo "📦 Files: $FILES"

TS=$(date -u +%Y%m%d%H%M%S)
PKG="/tmp/wdp-frontend-$TS.tar.gz"

echo "📦 Creating package: $PKG"
tar -czf "$PKG" $FILES

echo "📤 Uploading package to remote /tmp/ ..."
scp -i "$SSH_KEY" "$PKG" "$USER@$HOST:/tmp/" >/dev/null

echo "🚀 Executing remote deployment ..."
ssh -i "$SSH_KEY" "$USER@$HOST" bash -s <<EOF
set -euo pipefail

PKG="/tmp/$(basename "$PKG")"
DOCROOT="$DOCROOT"
BACKUP_DIR="$BACKUP_DIR"

echo "📁 Ensuring directories exist ..."
sudo mkdir -p "\$DOCROOT" "\$BACKUP_DIR"

echo "🧰 Creating backup archive (if files exist) ..."
BACKUP_FILE="\$BACKUP_DIR/wdp-frontend-backup-$TS.tar.gz"
cd "\$DOCROOT"
# Backup only files that exist among the set; ignore missing
tar -czf "\$BACKUP_FILE" \
  $(for f in $FILES; do echo -n " --ignore-failed-read \"$f\""; done)
echo "✅ Backup saved: \$BACKUP_FILE"

echo "📦 Extracting new package into docroot ..."
sudo tar -xzf "\$PKG" -C "\$DOCROOT"

echo "🔐 Setting ownership and permissions ..."
sudo chown -R www-data:www-data "\$DOCROOT"
sudo find "\$DOCROOT" -type d -exec chmod 755 {} +
sudo find "\$DOCROOT" -type f -exec chmod 644 {} +

echo "🧹 Cleaning up remote package ..."
rm -f "\$PKG"

echo "🔄 Reloading Nginx ..."
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Remote deployment step complete"
EOF

echo "🧹 Cleaning up local package ..."
rm -f "$PKG"

if [[ "$VERIFY" == "1" ]]; then
  echo "🔎 Running basic verification checks ..."
  set +e
  curl -I "https://$DOMAIN/" | head -n 1 || true
  for path in \
    "/js/personalization-ui.js" \
    "/js/personalization-system.js"; do
    echo "— HEAD https://$DOMAIN$path"
    curl -sI "https://$DOMAIN$path" | grep -iE "HTTP/|Content-Type|Cache-Control" || true
  done
  set -e
fi

echo "🎉 Frontend deployment finished!"
echo "• Domain: https://$DOMAIN"
echo "• Docroot: $DOCROOT"
echo "• Backup: $BACKUP_DIR (timestamped)"
