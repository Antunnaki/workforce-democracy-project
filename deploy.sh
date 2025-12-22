#!/bin/bash
# WORKFORCE DEMOCRACY PROJECT - UNIFIED DEPLOYMENT SCRIPT
# Version: 2.0.0
# Usage: ./deploy.sh [beta|production]

TARGET=${1:-beta}
VPS_IP="185.193.126.13"
REMOTE_USER="root"

echo "🚀 Starting Deployment to $TARGET..."

if [ "$TARGET" == "beta" ]; then
    REMOTE_DIR="/srv/wdp/beta/current"
    FRONTEND_DIR="$REMOTE_DIR/frontend"
    PORT=3001
    USER="wdp-beta"
    API_URL="https://api-beta.workforcedemocracyproject.org"
    SITE_URL="https://beta.workforcedemocracyproject.org"
else
    REMOTE_DIR="/srv/wdp/current-prod"
    FRONTEND_DIR="/var/www/workforcedemocracyproject.org"
    PORT=3000
    USER="deploy"
    API_URL="https://api.workforcedemocracyproject.org"
    SITE_URL="https://workforcedemocracyproject.org"
fi

echo "📦 Syncing files..."
echo "  -> Backend to $REMOTE_DIR/backend/..."

# 1. Upload Backend
# Exclude node_modules, .env, large data/archive folders, .git, and backups to speed up upload
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'archive' \
    --exclude 'data' \
    --exclude '.git' \
    --exclude '*.bak' \
    --exclude '*~' \
    backend/ $REMOTE_USER@$VPS_IP:$REMOTE_DIR/backend/

# 2. Upload Frontend
echo "  -> Frontend to $FRONTEND_DIR..."

# If production, use config.prod.json as config.json
if [ "$TARGET" == "production" ]; then
    cp config.prod.json config.json.tmp
    # Also ensure env-config.mjs uses production settings if necessary, 
    # but env-config.prod.mjs seems to be the one to use.
    # However, index.html likely imports env-config.mjs.
    cp env-config.prod.mjs env-config.mjs.tmp
fi

# Use rsync for frontend too, excluding the archive and other non-essential folders
rsync -avz \
    --delete \
    --exclude 'archive' \
    --exclude 'backend' \
    --exclude 'node_modules' \
    --exclude 'scripts' \
    --exclude 'ops' \
    --exclude 'docs' \
    --exclude 'data' \
    --exclude '.git' \
    --exclude '.idea' \
    --exclude '*.bak' \
    --exclude 'config.prod.json' \
    --exclude 'env-config.prod.mjs' \
    ./ $REMOTE_USER@$VPS_IP:$FRONTEND_DIR/

# If we used temp files, sync them as their correct names and then cleanup
if [ "$TARGET" == "production" ]; then
    scp config.json.tmp $REMOTE_USER@$VPS_IP:$FRONTEND_DIR/config.json
    scp env-config.mjs.tmp $REMOTE_USER@$VPS_IP:$FRONTEND_DIR/env-config.mjs
    rm config.json.tmp env-config.mjs.tmp
fi

# 3. Upload Security Configurations
echo "  -> Security Configurations..."
# We no longer upload the master fix script as a separate file, 
# but we ensure the local config files for Nginx are present if needed.
# (Logic now integrated into remote execution)

# 4. Remote Execution
echo "⚙️  Executing remote updates and restarting server..."
ssh $REMOTE_USER@$VPS_IP << EOF
    # Run Nginx/CORS Fix (If script exists on VPS)
    if [ -f "/root/MASTER-VPS-FIX.sh" ]; then
        bash /root/MASTER-VPS-FIX.sh
    fi

    # Ensure dependencies are installed in backend
    cd "$REMOTE_DIR/backend"
    npm install zipcodes xml2js node-fetch@2 --quiet

    # Kill existing process on port $PORT
    echo "Stopping existing process on port $PORT..."
    fuser -k $PORT/tcp 2>/dev/null || true
    pkill -u $USER node || true
    pkill -u deploy node || true

    # Set permissions on the real path
    REAL_DIR_VAL=\$(readlink -f "$REMOTE_DIR")
    echo "🔧 Setting permissions and ownership on \$REAL_DIR_VAL..."
    chown -R $USER:$USER "\$REAL_DIR_VAL"
    find "\$REAL_DIR_VAL" -type d -exec chmod 755 {} +
    find "\$REAL_DIR_VAL" -type f -exec chmod 644 {} +

    # Set permissions for frontend if different from REAL_DIR_VAL
    REAL_FRONTEND_VAL=\$(readlink -f "$FRONTEND_DIR")
    if [ "\$REAL_FRONTEND_VAL" != "\$REAL_DIR_VAL" ]; then
        echo "🔧 Setting permissions and ownership on \$REAL_FRONTEND_VAL..."
        chown -R www-data:www-data "\$REAL_FRONTEND_VAL"
        find "\$REAL_FRONTEND_VAL" -type d -exec chmod 755 {} +
        find "\$REAL_FRONTEND_VAL" -type f -exec chmod 644 {} +
    fi
    
    # Ensure Nginx can read frontend files
    usermod -a -G $USER www-data || true

    # Start the server as the correct user
    echo "Starting Node server on port $PORT..."
    cd "\$REAL_DIR_VAL"
    sudo -u $USER /usr/bin/node backend/server.js > backend/server.log 2>&1 &
    
    echo "✅ Remote execution complete."
EOF

echo "✨ Deployment Finished!"
echo "🔗 Site: $SITE_URL"
echo "🔗 API Health: $API_URL/api/civic/health"