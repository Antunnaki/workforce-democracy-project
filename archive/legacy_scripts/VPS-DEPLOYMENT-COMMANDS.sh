#!/bin/bash
# VPS Deployment Script - v37.0.2
# Run these commands ONE AT A TIME on your VPS

echo "========================================="
echo "STEP 1: Backup Current Files"
echo "========================================="
sudo mkdir -p /var/www/workforce-democracy/backups/v37.0.1
sudo cp -r /var/www/workforce-democracy/civic /var/www/workforce-democracy/backups/v37.0.1/
echo "✅ Backup created"

echo ""
echo "========================================="
echo "STEP 2: Download Corrected File"
echo "========================================="
echo "You need to upload civic-api-CORRECTED-v37.0.2.js to your VPS"
echo "Use one of these methods:"
echo ""
echo "METHOD 1: SCP from your local machine"
echo "  scp civic-api-CORRECTED-v37.0.2.js user@your-vps:/tmp/"
echo ""
echo "METHOD 2: Create file directly on VPS"
echo "  sudo nano /var/www/workforce-democracy/civic/backend/civic-api.js"
echo "  Then paste the corrected content"
echo ""
echo "Press Enter when file is ready..."
read

echo ""
echo "========================================="
echo "STEP 3: Move File to Correct Location"
echo "========================================="
# If you used SCP:
# sudo mv /tmp/civic-api-CORRECTED-v37.0.2.js /var/www/workforce-democracy/civic/backend/civic-api.js

echo "If you uploaded to /tmp/, run:"
echo "  sudo mv /tmp/civic-api-CORRECTED-v37.0.2.js /var/www/workforce-democracy/civic/backend/civic-api.js"
echo ""
echo "Press Enter when file is moved..."
read

echo ""
echo "========================================="
echo "STEP 4: Set Correct Permissions"
echo "========================================="
sudo chown www-data:www-data /var/www/workforce-democracy/civic/backend/civic-api.js
sudo chmod 644 /var/www/workforce-democracy/civic/backend/civic-api.js
echo "✅ Permissions set"

echo ""
echo "========================================="
echo "STEP 5: Verify API Keys"
echo "========================================="
echo "Checking .env file for required API keys..."
sudo cat /var/www/workforce-democracy/backend/.env | grep API_KEY
echo ""
echo "You should see:"
echo "  GROQ_API_KEY=gsk_..."
echo "  CONGRESS_API_KEY=..."
echo "  OPENSTATES_API_KEY=..."
echo ""
echo "If any are missing, edit .env file:"
echo "  sudo nano /var/www/workforce-democracy/backend/.env"
echo ""
echo "Press Enter to continue..."
read

echo ""
echo "========================================="
echo "STEP 6: Restart Backend"
echo "========================================="
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend
echo "✅ Backend restarted"

echo ""
echo "========================================="
echo "STEP 7: Check Logs"
echo "========================================="
echo "Checking for startup errors..."
sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 20
echo ""
echo "Look for:"
echo "  ✅ '🏛️  Civic Platform API initialized'"
echo "  ✅ 'Server running on port 3001'"
echo "  ❌ Any error messages"
echo ""
echo "Press Enter to continue to testing..."
read

echo ""
echo "========================================="
echo "STEP 8: Test Endpoints"
echo "========================================="

echo "Testing LLM health..."
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | python3 -m json.tool
echo ""

echo "Testing representative search (ZIP: 10001)..."
curl -s "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=10001" | python3 -m json.tool
echo ""

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "========================================="
echo "Next steps:"
echo "1. Test chat on: https://workforcedemocracyproject.org/civic-platform.html"
echo "2. Search for representatives with ZIP code: 10001"
echo "3. If issues persist, send me the PM2 logs"
echo ""
