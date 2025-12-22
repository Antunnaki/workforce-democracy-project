#!/usr/bin/env bash
# Workforce Democracy Project - Install Frontend Deployment Helper
# Purpose: Install the server-side helper and sudoers configuration

set -euo pipefail

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root"
    exit 1
fi

# Source and destination paths
HELPER_SOURCE="/tmp/wdp-frontend-deploy-helper.sh"
HELPER_DEST="/usr/local/bin/wdp-frontend-deploy.sh"
SUDOERS_SOURCE="/tmp/sudoers-wdp-frontend-deploy"
SUDOERS_DEST="/etc/sudoers.d/wdp-frontend-deploy"

# Check if source files exist
if [[ ! -f "$HELPER_SOURCE" ]]; then
    echo "Helper script not found at $HELPER_SOURCE"
    echo "Please upload ops/TEMPLATES/wdp-frontend-deploy-helper.sh to /tmp/ on the server"
    exit 1
fi

if [[ ! -f "$SUDOERS_SOURCE" ]]; then
    echo "Sudoers file not found at $SUDOERS_SOURCE"
    echo "Please upload ops/TEMPLATES/sudoers-wdp-frontend-deploy to /tmp/ on the server"
    exit 1
fi

# Install the helper script
echo "Installing helper script to $HELPER_DEST"
install -m 750 "$HELPER_SOURCE" "$HELPER_DEST"
chown root:root "$HELPER_DEST"

# Validate and install sudoers configuration
echo "Validating and installing sudoers configuration"
visudo -c -f "$SUDOERS_SOURCE"
if [[ $? -eq 0 ]]; then
    install -m 440 "$SUDOERS_SOURCE" "$SUDOERS_DEST"
    echo "Sudoers configuration installed successfully"
else
    echo "Error: Invalid sudoers configuration"
    exit 1
fi

# Create log file with appropriate permissions
touch /var/log/wdp-frontend-deploy.log
chown deploy:adm /var/log/wdp-frontend-deploy.log
chmod 644 /var/log/wdp-frontend-deploy.log

# Create backup directory
mkdir -p /var/backups
chown deploy:www-data /var/backups
chmod 755 /var/backups

# Clean up temporary files
rm -f "$HELPER_SOURCE" "$SUDOERS_SOURCE"

echo "✅ Frontend deployment helper installed successfully!"
echo "The deploy user can now run frontend deployments without password prompts."
echo ""
echo "Expected output:"
echo "  - Helper installed at: $HELPER_DEST (owned by root:root, mode 750)"
echo "  - Sudoers config at: $SUDOERS_DEST (mode 440)"
echo "  - Log file at: /var/log/wdp-frontend-deploy.log"
echo "  - Backup directory at: /var/backups"
echo ""
echo "Verifying configuration:"
visudo -cf /etc/sudoers
visudo -cf "$SUDOERS_DEST"
echo "Configuration verified successfully!"