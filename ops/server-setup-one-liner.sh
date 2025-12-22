#!/bin/bash
# One-liner approach to setup frontend deployment helper on the server
# This script combines uploading files and setting up the helper in one step

echo "🚀 Starting one-liner server setup..."

# Upload all files to the server
echo "📤 Uploading files to server..."
scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/TEMPLATES/wdp-frontend-deploy-helper.sh \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/sudoers-wdp-frontend-deploy \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/setup-frontend-deploy.sh \
  deploy@185.193.126.13:/tmp/

echo "✅ Files uploaded successfully!"

echo ""
echo "=============================================="
echo "SERVER SETUP - COPY AND PASTE THIS BLOCK"
echo "=============================================="
echo ""

# Create the one-liner command for the server admin
cat << 'EOF'
ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13 << 'ENDSSH'
#!/usr/bin/env bash
set -euo pipefail
umask 022

HELPER_SRC=/tmp/wdp-frontend-deploy-helper.sh
HELPER_DST=/usr/local/bin/wdp-frontend-deploy-helper.sh
SUDOERS_FILE=/etc/sudoers.d/sudoers-wdp-frontend-deploy
DOCROOT=/var/www/workforcedemocracyproject.org

echo "🔧 Installing frontend deployment helper..."

# Install the helper script
install -o root -g root -m 0750 "$HELPER_SRC" "$HELPER_DST"

# Install the sudoers configuration
cat >"$SUDOERS_FILE" <<'SUDOEOF'
Defaults!/usr/local/bin/wdp-frontend-deploy-helper.sh env_reset
deploy ALL=(root) NOPASSWD: /usr/local/bin/wdp-frontend-deploy-helper.sh
SUDOEOF
chown root:root "$SUDOERS_FILE" && chmod 0440 "$SUDOERS_FILE"

# Validate sudoers configuration
visudo -cf /etc/sudoers >/dev/null
visudo -cf "$SUDOERS_FILE" >/dev/null

# Set proper permissions on docroot
mkdir -p "$DOCROOT"
chown -R www-data:www-data "$DOCROOT"
find "$DOCROOT" -type d -exec chmod 755 {} +
find "$DOCROOT" -type f -exec chmod 644 {} +

# Create log file
touch /var/log/wdp-frontend-deploy.log
chown deploy:adm /var/log/wdp-frontend-deploy.log
chmod 644 /var/log/wdp-frontend-deploy.log

# Create backup directory
mkdir -p /var/backups
chown deploy:www-data /var/backups
chmod 755 /var/backups

echo "✅ Frontend deploy helper installed and sudoers configured."

# Test the helper
echo "🧪 Testing helper script..."
sudo -u deploy /usr/local/bin/wdp-frontend-deploy-helper.sh --help || true

echo "🎉 Setup complete! You can now run the frontend deployment from your local machine."
ENDSSH
EOF