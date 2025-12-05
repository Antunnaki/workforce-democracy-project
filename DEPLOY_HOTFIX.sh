#!/bin/bash

echo "🔧 Deploying Hotfix v37.2.1..."
echo ""

# Navigate to project directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.2.0"

# Upload fixed file
echo "⬆️  Uploading fixed ai-service.js..."
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js

# Restart backend
echo "🔄 Restarting backend..."
ssh root@185.193.126.13 "pm2 restart backend"

# Show status
echo "📊 Backend status:"
ssh root@185.193.126.13 "pm2 status backend"

echo ""
echo "✅ Hotfix deployed!"
echo ""
echo "🧪 Test now:"
echo "1. Ask: 'Tell me about Dorcey Applyrs'"
echo "2. Watch logs: ssh root@185.193.126.13 'pm2 logs backend --lines 0'"
echo "3. Look for: 📰 Searching local news, 🗳️ Searching Ballotpedia"
