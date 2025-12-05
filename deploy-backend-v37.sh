#!/bin/bash

##############################################################################
# Backend Deployment Script v37.0.1
# Purpose: Deploy updated backend code to VPS
# Usage: ./deploy-backend-v37.sh
##############################################################################

set -e  # Exit on error

echo "🚀 Workforce Democracy Backend Deployment v37.0.1"
echo "=================================================="
echo ""

# Configuration
VPS_USER="root"
VPS_HOST="185.193.126.13"
VPS_BACKEND_PATH="/var/www/workforce-democracy/backend"
PM2_PATH="/opt/nodejs/bin/pm2"
LOCAL_BACKEND_PATH="./backend"

echo "📋 Deployment Configuration:"
echo "   VPS: ${VPS_USER}@${VPS_HOST}"
echo "   Backend Path: ${VPS_BACKEND_PATH}"
echo "   Local Source: ${LOCAL_BACKEND_PATH}"
echo ""

# Check if backend directory exists locally
if [ ! -d "${LOCAL_BACKEND_PATH}" ]; then
    echo "❌ Error: Local backend directory not found: ${LOCAL_BACKEND_PATH}"
    echo "   Please run this script from the project root directory."
    exit 1
fi

echo "✅ Local backend directory found"
echo ""

# Step 1: Create backup on VPS
echo "📦 Step 1: Creating backup on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    BACKUP_DIR="/var/www/workforce-democracy/backend-backups"
    BACKUP_NAME="backend-backup-$(date +%Y%m%d-%H%M%S)"
    
    mkdir -p ${BACKUP_DIR}
    cp -r /var/www/workforce-democracy/backend ${BACKUP_DIR}/${BACKUP_NAME}
    
    echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Keep only last 5 backups
    cd ${BACKUP_DIR}
    ls -t | tail -n +6 | xargs -r rm -rf
    echo "✅ Old backups cleaned (keeping last 5)"
ENDSSH

echo ""

# Step 2: Upload new backend files
echo "📤 Step 2: Uploading new backend files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'package-lock.json' \
    ${LOCAL_BACKEND_PATH}/ ${VPS_USER}@${VPS_HOST}:${VPS_BACKEND_PATH}/

echo "✅ Files uploaded"
echo ""

# Step 3: Install dependencies and restart
echo "🔧 Step 3: Installing dependencies and restarting backend..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    cd /var/www/workforce-democracy/backend
    
    # Install dependencies
    npm install --production
    
    # Restart PM2 process
    sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend
    
    # Show status
    echo ""
    echo "📊 PM2 Status:"
    sudo /opt/nodejs/bin/pm2 status workforce-democracy-backend
    
    echo ""
    echo "📝 Recent logs:"
    sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 10 --nostream
ENDSSH

echo ""
echo "✅ Backend deployment complete!"
echo ""

# Step 4: Test endpoints
echo "🧪 Step 4: Testing endpoints..."
echo ""

echo "Testing health check..."
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | jq '.'

echo ""
echo "Testing CORS headers..."
curl -I https://api.workforcedemocracyproject.org/api/civic/llm-health | grep -i "access-control"

echo ""
echo "=================================================="
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Test frontend at: https://workforcedemocracyproject.org/civic-platform.html"
echo "2. Check browser console for errors"
echo "3. Test ZIP search (12061)"
echo "4. Test LLM chat"
echo ""
