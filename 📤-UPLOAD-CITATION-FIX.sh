#!/bin/bash

#############################################################################
# UPLOAD CITATION FIX FILES TO VPS
# 
# Uploads both required files from your local machine to VPS
# Local path: /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.4.0
#############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "   📤 UPLOADING CITATION FIX FILES TO VPS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Navigate to project directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.4.0"

# Upload citation validator (NEW file)
echo "📤 Uploading citation-validator-v37.4.0.js..."
scp backend/citation-validator-v37.4.0.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Upload modified ai-service.js
echo "📤 Uploading updated ai-service.js..."
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Upload deployment script
echo "📤 Uploading deployment script..."
scp 🚀-DEPLOY-CITATION-FIX-v37.4.0.sh root@185.193.126.13:~/

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "   ✅ FILES UPLOADED SUCCESSFULLY!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Next step: SSH into VPS and run deployment:"
echo ""
echo "  ssh root@185.193.126.13"
echo "  cd /var/www/workforce-democracy/backend"
echo "  bash ~/🚀-DEPLOY-CITATION-FIX-v37.4.0.sh"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
