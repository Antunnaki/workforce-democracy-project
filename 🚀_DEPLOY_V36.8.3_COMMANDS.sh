#!/bin/bash

# V36.8.3 Complete Deployment
# Fixes: Typewriter scroll lock + Source hierarchy + More critical analysis

echo "=================================="
echo "V36.8.3 Deployment Starting"
echo "=================================="
echo ""

# Step 1: Upload backend file
echo "📤 Step 1: Uploading backend/ai-service.js..."
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js.v36.8.3

if [ $? -eq 0 ]; then
    echo "✅ Backend file uploaded successfully"
else
    echo "❌ Backend upload failed"
    exit 1
fi

echo ""

# Step 2: Upload frontend file
echo "📤 Step 2: Uploading js/markdown-renderer.js..."
scp js/markdown-renderer.js root@185.193.126.13:/var/www/workforce-democracy/js/markdown-renderer.js.v36.8.3

if [ $? -eq 0 ]; then
    echo "✅ Frontend file uploaded successfully"
else
    echo "❌ Frontend upload failed"
    exit 1
fi

echo ""
echo "📦 Both files uploaded! Now deploying on VPS..."
echo ""

# Step 3: Deploy on VPS
ssh root@185.193.126.13 << 'ENDSSH'
echo "=================================="
echo "Deploying V36.8.3 on VPS"
echo "=================================="
echo ""

# Deploy backend
echo "🔧 Deploying backend..."
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service.js.backup.$(date +%Y%m%d_%H%M%S)
mv ai-service.js.v36.8.3 ai-service.js

echo "♻️  Restarting PM2..."
pm2 restart workforce-backend

echo ""
echo "✅ Backend deployed!"
echo ""

# Deploy frontend
echo "🔧 Deploying frontend..."
cd /var/www/workforce-democracy/js
if [ -f markdown-renderer.js ]; then
    cp markdown-renderer.js markdown-renderer.js.backup.$(date +%Y%m%d_%H%M%S)
fi
mv markdown-renderer.js.v36.8.3 markdown-renderer.js

echo ""
echo "✅ Frontend deployed!"
echo ""

echo "=================================="
echo "Verification"
echo "=================================="

# Verify backend
echo "🔍 Checking backend..."
if grep -q "Independent/Community-Funded Media" /var/www/workforce-democracy/backend/ai-service.js; then
    echo "✅ V36.8.3 backend prompts confirmed"
else
    echo "⚠️  Backend verification failed"
fi

# Verify frontend
echo "🔍 Checking frontend..."
if grep -q "V36.8.3" /var/www/workforce-democracy/js/markdown-renderer.js; then
    echo "✅ V36.8.3 frontend fix confirmed"
else
    echo "⚠️  Frontend verification failed"
fi

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs workforce-backend --lines 15 --nostream

echo ""
echo "=================================="
echo "🎉 V36.8.3 Deployment Complete!"
echo "=================================="
ENDSSH

echo ""
echo "✅ All done! Test your site now."
echo ""
