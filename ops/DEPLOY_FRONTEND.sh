#!/usr/bin/env bash
# Workforce Democracy Project — Frontend Deployment Script (VPS)
# Purpose: Safely deploy updated frontend files (privacy-first onboarding, etc.) to the VPS
# Author: Junie (automation)
# Date: 2025-12-14

#Rollback: Backups are automatically created in /var/backups/
# Pattern: /var/backups/wdp-frontend-backup-<timestamp>.tar.gz
# To rollback, use the server-side helper:
#   sudo /usr/local/bin/wdp-frontend-deploy.sh extract /var/backups/wdp-frontend-backup-<timestamp>.tar.gz /var/www/workforcedemocracyproject.org
#   sudo /usr/local/bin/wdp-frontend-deploy.sh reload

set -euo pipefail

# =============================
# Usage
# =============================
# Export or pass the following environment variables before running:
# USER– SSH user on the VPS (e.g., deploy)
#   HOST        – VPS host or IP (e.g., 185.193.126.13)
#   SSH_KEY     – Path to SSH private key (e.g., ~/.ssh/id_ed25519_njalla)
#   DOMAIN      – Primary domain being deployed (e.g., workforcedemocracyproject.org)
#   DOCROOT     – Remote document root (default: /var/www/workforcedemocracyproject.org)
#   FILES       – Space-separated list of files/dirs to include inthepackage
#                 Default focuses on the privacy-first onboarding changes:
#                 "index.html js/personalization-ui.js js/personalization-system.js data"
# Optional flags:
#   BACKUP_DIR  – Remote backup dir (default: /var/backups)
#   VERIFY      – If set to 1, run basic HTTP(S) checks after deploy
#
# Example:
#   USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org \
#   ./ops/DEPLOY_FRONTEND.sh
#
# Example (full sync of core assets):
#   FILES="index.html js css images sw.js manifest.json data" \
#   USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org \
#   ./ops/DEPLOY_FRONTEND.sh

USER=${USER:-}
HOST=${HOST:-}
SSH_KEY=${SSH_KEY:-}
DOMAIN=${DOMAIN:-workforcedemocracyproject.org}
DOCROOT=${DOCROOT:-/var/www/workforcedemocracyproject.org}
BACKUP_DIR=${BACKUP_DIR:-/var/backups}
FILES=${FILES:-"index.html js/personalization-ui.js js/personalization-system.js data"}
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
echo "👤 $USER@$HOST —docroot: $DOCROOT"
echo "📦 Files: $FILES"

TS=$(date -u +%Y%m%d%H%M%S)
PKG="/tmp/wdp-frontend-$TS.tar.gz"
PKG_CHECKSUM="/tmp/wdp-frontend-$TS.tar.gz.sha256"

echo "📦 Creating package: $PKG"
COPYFILE_DISABLE=1 tar --exclude='._*' -czf "$PKG" $FILES

echo "🔍 Generating checksum: $PKG_CHECKSUM"
shasum -a 256 "$PKG" > "$PKG_CHECKSUM"

echo "📤 Uploading package and checksum to remote /tmp/ ..."
scp -i "$SSH_KEY" "$PKG" "$USER@$HOST:/tmp/" >/dev/null
scp -i "$SSH_KEY" "$PKG_CHECKSUM" "$USER@$HOST:/tmp/" >/dev/null

echo "🚀 Executing remote deployment ..."
ssh -i "$SSH_KEY" "$USER@$HOST" bash -s <<EOF
set -euo pipefail

PKG="/tmp/$(basename "$PKG")"
PKG_CHECKSUM="/tmp/$(basename "$PKG_CHECKSUM")"
DOCROOT="$DOCROOT"

echo "🔍 Verifying package checksum ..."
sha256sum -c "\$PKG_CHECKSUM" || { echo"Checksum verification failed!"; exit 1; }

echo "📦 Extracting new package into docroot ..."
# Use the helper script instead of direct tar extraction
sudo /usr/local/bin/wdp-frontend-deploy-helper.sh extract "\$PKG" "\$DOCROOT"

echo "🧹 Cleaning up remote package and checksum ..."
rm -f "\$PKG" "\$PKG_CHECKSUM"

echo "✅ Remote deployment step complete"
EOF

echo "🧹 Cleaning up local package and checksum ..."
rm -f "$PKG" "$PKG_CHECKSUM"

if [[ "$VERIFY" == "1" ]]; then
  echo "🔎 Running basic verification checks ..."
set +e
  curl -I "https://$DOMAIN/" | head -n 1 || true
  for path in \
    "/js/personalization-ui.js" \
    "/js/personalization-system.js" \
    "/data/voting-info.json"; do
    echo "— HEAD https://$DOMAIN\$path"
    curl -sI "https://$DOMAIN\$path" | grep -iE "HTTP/|Content-Type|Cache-Control" || true
  done
  set -e
fi

echo "🎉 Frontend deployment finished!"
echo "• Domain: https://$DOMAIN"
echo "• Docroot: $DOCROOT"
echo "• Backup: $BACKUP_DIR (timestamped)"