#!/bin/bash

#############################################################################
# UPLOAD URGENT FIX TO VPS
# 
# Uploads updated ai-service.js with constitutional terms fix
#############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "   📤 UPLOADING URGENT FIX TO VPS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Navigate to project
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.4.0"

# Upload fixed ai-service.js
echo "📤 Uploading updated ai-service.js..."
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Upload deployment script
echo "📤 Uploading deployment script..."
scp 🚨-URGENT-SOURCES-FIX-v37.4.0.sh root@185.193.126.13:~/

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "   ✅ URGENT FIX UPLOADED!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Next: SSH and deploy"
echo ""
echo "  ssh root@185.193.126.13"
echo "  cd /var/www/workforce-democracy/backend"
echo "  bash ~/🚨-URGENT-SOURCES-FIX-v37.4.0.sh"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
