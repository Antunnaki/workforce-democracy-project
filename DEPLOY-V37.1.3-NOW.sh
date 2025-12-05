#!/bin/bash
# =============================================================================
# WORKFORCE DEMOCRACY PROJECT - v37.1.3 Deployment Script
# =============================================================================
# Date: Tuesday, November 4, 2025
# Version: 37.1.3
# 
# This script helps you deploy the fixes for:
# 1. Badge colors (NUCLEAR fix with !important)
# 2. LLM current date awareness
# 3. CORS whitelist for page.gensparksite.com
# =============================================================================

echo "🚀 WORKFORCE DEMOCRACY PROJECT - v37.1.3 DEPLOYMENT"
echo "=================================================="
echo ""
echo "FIXES IN THIS VERSION:"
echo "  ✅ Badge colors (with !important in inline styles)"
echo "  ✅ LLM knows current date (Tuesday, November 4, 2025)"
echo "  ✅ CORS for page.gensparksite.com"
echo ""
echo "=================================================="
echo ""

# =============================================================================
# STEP 1: FIX CORS (Most Urgent)
# =============================================================================

echo "STEP 1: FIX CORS ON VPS"
echo "----------------------"
echo ""
echo "Run these commands on your VPS:"
echo ""
echo "  ssh workforce@198.211.117.125"
echo "  sudo nano /etc/nginx/sites-available/workforce-backend"
echo ""
echo "Find the 'map' section and add this line:"
echo ""
echo '  "https://page.gensparksite.com" $http_origin;'
echo ""
echo "Then save and reload:"
echo ""
echo "  sudo nginx -t"
echo "  sudo systemctl reload nginx"
echo "  exit"
echo ""
read -p "Press Enter once CORS is fixed..."

# =============================================================================
# STEP 2: DEPLOY BACKEND (AI Date Awareness)
# =============================================================================

echo ""
echo "STEP 2: DEPLOY BACKEND (AI SERVICE)"
echo "-----------------------------------"
echo ""
echo "Run these commands on your VPS:"
echo ""
echo "  ssh workforce@198.211.117.125"
echo "  cd /var/www/workforce-backend"
echo "  cp backend/ai-service.js backend/ai-service.js.backup"
echo ""
echo "Then upload the new ai-service.js file and run:"
echo ""
echo "  pm2 restart workforce-backend"
echo "  pm2 logs workforce-backend"
echo "  exit"
echo ""
read -p "Press Enter once backend is deployed..."

# =============================================================================
# STEP 3: DEPLOY FRONTEND (Badge Colors)
# =============================================================================

echo ""
echo "STEP 3: DEPLOY FRONTEND (BADGE COLORS)"
echo "--------------------------------------"
echo ""
echo "Upload these files to GenSpark:"
echo ""
echo "  1. js/universal-chat.js"
echo "  2. css/unified-color-scheme.css (if not already uploaded)"
echo ""
echo "Then in your browser:"
echo ""
echo "  1. Open https://page.gensparksite.com"
echo "  2. Press Cmd+Shift+R (hard refresh)"
echo "  3. Open Civic Assistant chat"
echo "  4. Test badge colors"
echo ""
read -p "Press Enter once frontend is deployed..."

# =============================================================================
# STEP 4: TESTING
# =============================================================================

echo ""
echo "STEP 4: TESTING"
echo "---------------"
echo ""
echo "Test 1 - CORS:"
echo "  • Open https://page.gensparksite.com"
echo "  • Open any chat assistant"
echo "  • Ask a question"
echo "  • Should get response (no CORS error)"
echo ""
echo "Test 2 - Badge Colors:"
echo "  • Open chat with sources"
echo "  • Verify colors:"
echo "    🟢 Green = Independent"
echo "    🔵 Blue = Fact-checkers"
echo "    🟠 Orange = Finance"
echo "    ⚫ Gray = News"
echo ""
echo "Test 3 - Current Date:"
echo "  • Ask: 'What's today's date?'"
echo "  • Should say: 'Tuesday, November 4, 2025'"
echo ""
echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================================="
echo ""
echo "If badges are STILL gray, run the diagnostic:"
echo "  Upload test-badge-styles.html and open it"
echo ""
echo "If date is wrong, check VPS time:"
echo "  ssh workforce@198.211.117.125"
echo "  date"
echo ""
