#!/bin/bash
# 🚀 Quick Deployment Script for V36.7.0
# Copy-paste these commands one section at a time

echo "==================================="
echo "WORKFORCE DEMOCRACY V36.7.0 DEPLOYMENT"
echo "==================================="
echo ""

# ========================================
# STEP 1: SSH INTO VPS
# ========================================
echo "STEP 1: SSH into VPS and backup files"
echo "Run these commands:"
echo ""
echo "ssh root@185.193.126.13"
echo "cd /var/www/workforce-democracy/backend"
echo "cp server.js server.js.backup-v36.6.0"
echo "cp ai-service.js ai-service.js.backup-v36.6.0"
echo "cp government-apis.js government-apis.js.backup-v36.6.0"
echo "exit"
echo ""
read -p "Press Enter when backups are complete..."

# ========================================
# STEP 2: UPLOAD FILES FROM LOCAL
# ========================================
echo ""
echo "STEP 2: Upload new files from local machine"
echo "Run these commands on your LOCAL machine:"
echo ""
echo "scp backend/package.json root@185.193.126.13:/var/www/workforce-democracy/backend/"
echo "scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
echo "scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
echo "scp backend/government-apis.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
echo ""
read -p "Press Enter when uploads are complete..."

# ========================================
# STEP 3: INSTALL DEPENDENCIES
# ========================================
echo ""
echo "STEP 3: Install new dependencies"
echo "SSH back in and run:"
echo ""
echo "ssh root@185.193.126.13"
echo "cd /var/www/workforce-democracy/backend"
echo "npm install cheerio"
echo ""
read -p "Press Enter when cheerio is installed..."

# ========================================
# STEP 4: CLEAR CACHE
# ========================================
echo ""
echo "STEP 4: Clear old cached responses"
echo "Run this command:"
echo ""
echo 'sudo -u postgres psql -d workforce_democracy -c "TRUNCATE TABLE cached_responses;"'
echo ""
read -p "Press Enter when cache is cleared..."

# ========================================
# STEP 5: RESTART BACKEND
# ========================================
echo ""
echo "STEP 5: Restart backend service"
echo "Run these commands:"
echo ""
echo "pm2 restart workforce-backend"
echo "pm2 status"
echo ""
echo "✅ Look for 'status: online' for workforce-backend"
echo ""
read -p "Press Enter to see logs..."

# ========================================
# STEP 6: CHECK LOGS
# ========================================
echo ""
echo "STEP 6: Check logs for success indicators"
echo "Run this command:"
echo ""
echo "pm2 logs workforce-backend --lines 50"
echo ""
echo "✅ Look for:"
echo "  - llama-3.3-70b-versatile (confirms new model)"
echo "  - No syntax errors"
echo "  - Backend started on port 3000"
echo ""
read -p "Press Enter to test health check..."

# ========================================
# STEP 7: TEST HEALTH CHECK
# ========================================
echo ""
echo "STEP 7: Test health check endpoint"
echo "Run this command:"
echo ""
echo "curl https://api.workforcedemocracyproject.org/health"
echo ""
echo '✅ Expected: {"status":"ok","timestamp":"..."}'
echo ""
read -p "Press Enter to see test queries..."

# ========================================
# STEP 8: TEST QUERIES
# ========================================
echo ""
echo "STEP 8: Test with real queries"
echo ""
echo "Test 1: Eric Adams (should mention corruption)"
echo "Open Representatives chat and ask: 'Tell me about Eric Adams'"
echo "✅ Should mention: 'indicted on federal corruption charges'"
echo ""
echo "Test 2: Chuck Schumer (human rights lens)"
echo "Ask: 'What is Chuck Schumer's voting record?'"
echo "✅ Should say: 'insurance access through private markets, not universal healthcare'"
echo ""
echo "Test 3: UK Politician (global expansion)"
echo "Ask: 'Tell me about Keir Starmer'"
echo "✅ Should detect UK and use BBC/Guardian sources"
echo ""
echo "Test 4: Local Candidate"
echo "Ask: 'Who is running for NYC mayor?'"
echo "✅ Logs should show: '🗳️ Detected local candidate query'"
echo ""

# ========================================
# COMPLETE
# ========================================
echo ""
echo "==================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==================================="
echo ""
echo "If everything works:"
echo "  ✅ PM2 status: online"
echo "  ✅ Health check: ok"
echo "  ✅ Eric Adams: mentions indictment"
echo "  ✅ Human rights framework active"
echo "  ✅ Global expansion working"
echo ""
echo "If issues arise:"
echo "  - Check: pm2 logs workforce-backend --lines 100"
echo "  - Restore backup: cp server.js.backup-v36.6.0 server.js"
echo "  - See: DEPLOYMENT_GUIDE_V36.7.0.md"
echo ""
echo "Frontend typewriter effect (separate deployment):"
echo "  ⏳ Backend ready (sends plain text with \\n\\n)"
echo "  ⏳ Frontend needs update to convert to <p> tags"
echo ""
echo "🌍💚 Your AI is now global and grounded in human rights!"
