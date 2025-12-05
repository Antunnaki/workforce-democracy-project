#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# PERSONALIZATION DEPLOYMENT - v37.11.4 (CORRECTED)
# ═══════════════════════════════════════════════════════════════════════════
# 
# CRITICAL: This uses CORRECTED files that fix backend consolidation issues
# 
# Run from: /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION
# 
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🚀 PERSONALIZATION DEPLOYMENT - v37.11.4"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Check we're in correct directory
if [ ! -d "backend" ]; then
    echo "❌ ERROR: backend/ directory not found"
    echo "Please run from project root: WDP-v37.11.4-PERSONALIZATION/"
    exit 1
fi

echo "✅ Project directory confirmed"
echo ""

# Verify corrected files exist
echo "📋 Checking for corrected files..."

if [ ! -f "backend/routes/personalization-CORRECTED.js" ]; then
    echo "❌ ERROR: backend/routes/personalization-CORRECTED.js not found"
    echo "Please run this from the AI-generated project directory"
    exit 1
fi

if [ ! -f "backend/server-CORRECTED-v37.11.4.js" ]; then
    echo "❌ ERROR: backend/server-CORRECTED-v37.11.4.js not found"
    echo "Please run this from the AI-generated project directory"
    exit 1
fi

echo "✅ All corrected files found"
echo ""

# Upload files
echo "📤 Uploading backend files to VPS..."
echo ""

scp -P 22 backend/routes/personalization-CORRECTED.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/ && echo "✅ Uploaded personalization-CORRECTED.js"

scp -P 22 backend/server-CORRECTED-v37.11.4.js root@185.193.126.13:/var/www/workforce-democracy/backend/ && echo "✅ Uploaded server-CORRECTED-v37.11.4.js"

echo ""
echo "✅ Files uploaded successfully"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  📝 NEXT STEPS - SSH into VPS and run these commands:"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "ssh root@185.193.126.13 -p 22"
echo ""
echo "cd /var/www/workforce-democracy/backend"
echo ""
echo "# Backup current server.js"
echo "cp server.js server-BACKUP-\$(date +%Y%m%d-%H%M%S).js"
echo ""
echo "# Replace with corrected version"
echo "mv server-CORRECTED-v37.11.4.js server.js"
echo ""
echo "# Rename personalization route"
echo "mv routes/personalization-CORRECTED.js routes/personalization.js"
echo ""
echo "# Restart backend"
echo "pm2 restart workforce-backend"
echo ""
echo "# Check logs"
echo "pm2 logs workforce-backend --lines 20"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ UPLOAD COMPLETE - Now SSH and run the commands above"
echo "═══════════════════════════════════════════════════════════════════════════"
