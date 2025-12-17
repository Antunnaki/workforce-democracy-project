#!/usr/bin/env bash
set -euo pipefail

# Enhanced deployment script for both beta and production environments
# Usage: ./rsync-deploy.sh [beta|prod] [VPS_IP]

TARGET="${1:-}"  # prod|beta
VPS="${2:-}"     # your VPS IP

if [[ "$TARGET" != "prod" && "$TARGET" != "beta" ]]; then
  echo "Usage: $0 [beta|prod] [VPS_IP]"; exit 1; fi
if [[ -z "$VPS" ]]; then echo "Missing VPS_IP"; exit 1; fi

# Configuration based on target environment
if [[ "$TARGET" == "prod" ]]; then
  PORT=3000
  CUR=/srv/wdp/prod/current
  SERVICE=wdp-backend-prod
  DOMAIN="api.workforcedemocracyproject.org"
else
  PORT=3001
  CUR=/srv/wdp/beta/current
  SERVICE=wdp-backend-beta
  DOMAIN="api-beta.workforcedemocracyproject.org"
fi

REL=$(date -u +%Y%m%dT%H%M%SZ)
RSYNC_OPTS=( -avz --delete --exclude node_modules --exclude .git --exclude "*.log" )

echo "Deploying $TARGET to $VPS ($DOMAIN on port $PORT)"

# Deploy files
echo "Syncing files..."
rsync "${RSYNC_OPTS[@]}" -e 'ssh -i ~/.ssh/id_ed25519_njalla -o IdentitiesOnly=yes' \
  ./ deploy@"$VPS":/srv/wdp/"$TARGET"/releases/"$REL"/

# Update symlink and restart service
echo "Updating symlink and restarting service..."
ssh deploy@"$VPS" "ln -sfn /srv/wdp/$TARGET/releases/$REL $CUR && \
  cd $CUR/backend && \
  npm ci --omit=dev && \
  sudo systemctl restart $SERVICE && \
  sleep 1 && \
  sudo systemctl status $SERVICE --no-pager"

echo "Deployment complete!"
echo "Verifying health..."
sleep 2
./check-health.sh "https://$DOMAIN" || echo "Health check failed"

echo "Deployed $TARGET to $VPS on :$PORT at $(date)"