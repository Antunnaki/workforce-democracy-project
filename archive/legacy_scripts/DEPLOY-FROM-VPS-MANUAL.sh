#!/bin/bash

##############################################################################
# MANUAL DEPLOYMENT FROM VPS
# Run this script directly on the VPS if you can't access local files
##############################################################################

set -e

echo "🔧 Manual Deployment Starting..."
echo ""

# Navigate to backend
cd /var/www/workforce-democracy/backend

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="backups/pre-consolidation-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp ai-service.js "$BACKUP_DIR/ai-service.js.backup" 2>/dev/null || true
cp server.js "$BACKUP_DIR/server.js.backup" 2>/dev/null || true
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Create directories
echo "📁 Creating directory structure..."
mkdir -p routes
mkdir -p utils
echo "✅ Directories created"
echo ""

echo "⚠️  NEXT STEPS (Manual):"
echo ""
echo "1. On your LOCAL computer, use SCP to upload files:"
echo ""
echo "   scp backend/ai-service-MERGED-v37.1.0.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js"
echo "   scp backend/routes/civic-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/"
echo "   scp backend/utils/scraping-queue.js root@185.193.126.13:/var/www/workforce-democracy/backend/utils/"
echo ""
echo "2. Then come back here and run:"
echo "   nano server.js"
echo ""
echo "3. Add these lines after the other route requires:"
echo "   const civicRouter = require('./routes/civic-routes');"
echo "   app.use('/api/civic', civicRouter);"
echo ""
echo "4. Restart PM2:"
echo "   pm2 restart backend && pm2 save"
echo ""
echo "5. Test:"
echo "   curl https://api.workforcedemocracyproject.org/api/civic/health"
echo ""
