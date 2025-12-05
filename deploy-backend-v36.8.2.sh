#!/bin/bash

# V36.8.2 Backend Deployment Script
# Updates AI prompts with truth-guided discovery approach

echo "=================================="
echo "V36.8.2 Backend Deployment"
echo "=================================="
echo ""

# Upload the updated file
echo "📤 Uploading backend/ai-service.js to VPS..."
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js.v36.8.2

echo ""
echo "🔧 Now connecting to VPS to deploy..."
echo ""

# Execute deployment on VPS
ssh root@185.193.126.13 << 'ENDSSH'
cd /var/www/workforce-democracy/backend

echo "📁 Creating backup of current version..."
cp ai-service.js ai-service.js.backup.$(date +%Y%m%d_%H%M%S)

echo "🔄 Replacing with V36.8.2..."
mv ai-service.js.v36.8.2 ai-service.js

echo "♻️  Restarting PM2 backend..."
pm2 restart workforce-backend

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Checking PM2 status..."
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs workforce-backend --lines 20 --nostream

echo ""
echo "✅ Verifying prompt updates..."
if grep -q "V36.8.2" ai-service.js; then
    echo "✅ V36.8.2 prompts detected"
else
    echo "⚠️  Warning: V36.8.2 marker not found"
fi

if grep -q "Truth Through Discovery" ai-service.js; then
    echo "✅ New approach language confirmed"
else
    echo "⚠️  Warning: New approach language not found"
fi

echo ""
echo "=================================="
echo "Deployment Complete!"
echo "=================================="
ENDSSH

echo ""
echo "🎉 Done! Backend updated with V36.8.2 prompts"
echo ""
