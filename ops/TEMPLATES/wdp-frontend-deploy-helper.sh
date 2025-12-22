#!/bin/bash
# Workforce Democracy Project - Frontend Deployment Helper
# Purpose: Minimal privilege helper for frontend deployment operations
# This script should be installed on the server at /usr/local/bin/wdp-frontend-deploy.sh
# and configured in sudoers with NOPASSWD for the deploy user.

set -euo pipefail
umask 022

# Logging function
log() {
    logger -t wdp-frontend-deploy "[$(whoami)] $*"
    echo "[$(date -u)] $*" >> /var/log/wdp-frontend-deploy.log
}

# Check if running as deploy user or with sudo
if [[ $EUID -ne 0 ]] && [[ "$(whoami)" != "deploy" ]]; then
    echo "This script must be run as the deploy user or with sudo privileges"
    exit 1
fi

# Function to display usage
usage() {
    echo "Usage: $0 {extract|permissions|reload}"
    echo "  extract PACKAGE_FILE DOCROOT - Extract package to docroot"
    echo "  permissions DOCROOT - Set proper ownership and permissions"
    echo "  reload - Reload nginx service"
    exit 1
}

# Validate package file for security
validate_package() {
    local package_file=$1
    
    # Check if file exists
    if [[ ! -f "$package_file" ]]; then
        echo "Package file not found: $package_file"
        exit 1
    fi
    
    # Check if file is in /tmp
    if [[ ! "$package_file" =~ ^/tmp/[^/]+$ ]]; then
        echo "Package file must be in /tmp: $package_file"
        exit 1
    fi
    
    # Validate archive contents
    local invalid_entries
    invalid_entries=$(tar -tzf "$package_file" | grep -E '^/|\.\./' || true)
    if [[ -n "$invalid_entries" ]]; then
        echo "Invalid entries in package: $invalid_entries"
        exit 1
    fi
}

# Rotate backups
rotate_backups() {
    local backup_dir=${1:-/var/backups}
    local max_backups=${2:-10}
    
    if [[ -d "$backup_dir" ]]; then
        # Keep only the last $max_backups backups
        ls -t "$backup_dir"/wdp-frontend-backup-*.tar.gz 2>/dev/null | tail -n +$((max_backups + 1)) | xargs -r rm
    fi
}

# Check arguments
if [[ $# -lt 1 ]]; then
    usage
fi

ACTION=$1
shift

log "Starting action: $ACTION"

case "$ACTION" in
    extract)
        if [[ $# -ne 2 ]]; then
            echo "extract requires PACKAGE_FILE and DOCROOT arguments"
            exit 1
        fi
        
        PACKAGE_FILE=$1
        DOCROOT=$2
        
        # Validate inputs
        validate_package "$PACKAGE_FILE"
        
        if [[ ! -d "$DOCROOT" ]]; then
            echo "Docroot directory does not exist: $DOCROOT"
            exit 1
        fi
        
        # Create staging directory
        TS=$(date -u +%Y%m%d%H%M%S)
        STAGING_DIR="/var/www/.staging-$TS"
        BACKUP_DIR="/var/backups"
        
        # Create backup
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/wdp-frontend-backup-$TS.tar.gz"
        cd "$DOCROOT"
        tar -czf "$BACKUP_FILE" --exclude=".staging-*" .
        log "Backup created: $BACKUP_FILE"
        
        # Rotate old backups
        rotate_backups "$BACKUP_DIR" 10
        
        # Extract to staging directory
        mkdir -p "$STAGING_DIR"
        tar -xzf "$PACKAGE_FILE" -C "$STAGING_DIR"
        log "Package extracted to staging: $STAGING_DIR"
        
        # Set permissions on staging directory
        chown -R www-data:www-data "$STAGING_DIR"
        find "$STAGING_DIR" -type d -exec chmod 755 {} \;
        find "$STAGING_DIR" -type f -exec chmod 644 {} \;
        
        # Atomically move to docroot
        rsync -a --delete "$STAGING_DIR/" "$DOCROOT/"
        rm -rf "$STAGING_DIR"
        log "Staging moved to docroot: $DOCROOT"
        ;;
        
    permissions)
        if [[ $# -ne 1 ]]; then
            echo "permissions requires DOCROOT argument"
            exit 1
        fi
        
        DOCROOT=$1
        
        if [[ ! -d "$DOCROOT" ]]; then
            echo "Docroot directory does not exist: $DOCROOT"
            exit 1
        fi
        
        echo "Setting ownership and permissions for $DOCROOT"
        chown -R www-data:www-data "$DOCROOT"
        find "$DOCROOT" -type d -exec chmod 755 {} \;
        find "$DOCROOT" -type f -exec chmod 644 {} \;
        ;;
        
    reload)
        echo "Testing nginx configuration"
        nginx -t
        
        echo "Reloading nginx service"
        systemctl reload nginx
        ;;
        
    *)
        usage
        ;;
esac

log "Action '$ACTION' completed successfully"
echo "Action '$ACTION' completed successfully"