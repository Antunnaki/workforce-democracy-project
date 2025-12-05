#!/bin/bash

# 🚀 DEPLOY AI RESPONSE FIXES - v37.18.8
# Fixes: (1) Remove thinking blocks, (2) Remove contradictory ending, (3) Enhance contradictions

echo "🚀 Deploying AI Response Fixes v37.18.8 to Version B..."
echo ""

# SSH connection details
VPS_HOST="185.193.126.13"
VPS_USER="root"
BACKEND_PATH="/var/www/workforce-democracy/version-b/backend"

echo "📋 What this fixes:"
echo "  ✅ Fix #1: Remove <think> blocks from user responses"
echo "  ✅ Fix #2: Remove contradictory 'didn't find articles' ending"
echo "  ✅ Fix #3: Enhanced contradictions analysis for politicians"
echo ""

# Upload the fixed file
echo "📤 Uploading fixed ai-service.js to Version B..."
scp backend/ai-service.js ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/ai-service.js

if [ $? -eq 0 ]; then
    echo "✅ File uploaded successfully"
else
    echo "❌ Upload failed"
    exit 1
fi

echo ""
echo "🔄 Restarting Version B backend..."

# Restart the backend service
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /var/www/workforce-democracy/version-b/backend
sudo systemctl restart workforce-backend-b.service

# Wait a moment for service to start
sleep 3

# Check status
echo ""
echo "📊 Service Status:"
systemctl status workforce-backend-b.service --no-pager -l | head -20

echo ""
echo "📝 Recent Logs:"
tail -20 /var/log/workforce-backend-b.log
EOF

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🧪 TEST NOW:"
echo "1. Go to your Netlify test site"
echo "2. Find Chuck Schumer"
echo "3. Ask: 'What is Chuck Schumer's voting record on healthcare?'"
echo "4. Check for:"
echo "   ✅ NO <think> blocks visible"
echo "   ✅ NO 'didn't find articles' ending"
echo "   ✅ Enhanced 'Key Contradictions' section"
echo "   ✅ 7-11 Congress.gov sources"
echo ""
echo "📊 Check logs:"
echo "   ssh root@185.193.126.13"
echo "   tail -f /var/log/workforce-backend-b.log"
echo ""
