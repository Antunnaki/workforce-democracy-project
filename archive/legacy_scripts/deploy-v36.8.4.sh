#!/bin/bash

# V36.8.4 - Complete Fix
# 1. Backend: Democracy Now/Drop Site News prioritized, banned phrases removed
# 2. Frontend: Scroll lock fixed (removed auto-scroll during typing)
# 3. Citations: Made superscripts much smaller

echo "======================================"
echo "V36.8.4 Complete Deployment"
echo "======================================"
echo ""

echo "Step 1: Uploading backend/ai-service.js..."
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js.v36.8.4

if [ $? -ne 0 ]; then
    echo "ERROR: Backend upload failed!"
    exit 1
fi
echo "SUCCESS: Backend uploaded"
echo ""

echo "Step 2: Uploading js/markdown-renderer.js..."
scp js/markdown-renderer.js root@185.193.126.13:/var/www/workforce-democracy/js/markdown-renderer.js.v36.8.4

if [ $? -ne 0 ]; then
    echo "ERROR: Frontend JS upload failed!"
    exit 1
fi
echo "SUCCESS: Frontend JS uploaded"
echo ""

echo "Step 3: Uploading css/citations.css..."
scp css/citations.css root@185.193.126.13:/var/www/workforce-democracy/css/citations.css.v36.8.4

if [ $? -ne 0 ]; then
    echo "ERROR: CSS upload failed!"
    exit 1
fi
echo "SUCCESS: CSS uploaded"
echo ""

echo "Step 4: Deploying on VPS..."
echo ""

ssh root@185.193.126.13 << 'ENDSSH'
echo "======================================"
echo "Deploying V36.8.4 Files"
echo "======================================"
echo ""

# Backend
echo "Deploying backend..."
cd /var/www/workforce-democracy/backend
if [ -f ai-service.js ]; then
    cp ai-service.js ai-service.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backup created"
fi
mv ai-service.js.v36.8.4 ai-service.js
echo "Backend deployed"
echo ""

# Frontend JS
echo "Deploying frontend JS..."
cd /var/www/workforce-democracy/js
if [ -f markdown-renderer.js ]; then
    cp markdown-renderer.js markdown-renderer.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backup created"
fi
mv markdown-renderer.js.v36.8.4 markdown-renderer.js
echo "Frontend JS deployed"
echo ""

# CSS
echo "Deploying CSS..."
cd /var/www/workforce-democracy/css
if [ -f citations.css ]; then
    cp citations.css citations.css.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backup created"
fi
mv citations.css.v36.8.4 citations.css
echo "CSS deployed"
echo ""

# Restart PM2
echo "Restarting PM2..."
pm2 restart workforce-backend
echo "PM2 restarted"
echo ""

echo "======================================"
echo "Verification"
echo "======================================"
echo ""

# Verify backend
if grep -q "Democracy Now" /var/www/workforce-democracy/backend/ai-service.js; then
    echo "SUCCESS: V36.8.4 backend confirmed (Democracy Now prioritized)"
else
    echo "WARNING: Backend verification failed"
fi

if grep -q "BANNED PHRASES" /var/www/workforce-democracy/backend/ai-service.js; then
    echo "SUCCESS: Banned phrases section present"
else
    echo "WARNING: Banned phrases section missing"
fi

# Verify frontend
if grep -q "V36.8.4" /var/www/workforce-democracy/js/markdown-renderer.js; then
    echo "SUCCESS: Frontend JS confirmed (scroll fix)"
else
    echo "WARNING: Frontend JS verification failed"
fi

# Verify CSS
if grep -q "V36.8.4" /var/www/workforce-democracy/css/citations.css; then
    echo "SUCCESS: CSS confirmed (smaller citations)"
else
    echo "WARNING: CSS verification failed"
fi

echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "Recent logs (last 20 lines):"
pm2 logs workforce-backend --lines 20 --nostream

echo ""
echo "======================================"
echo "V36.8.4 Deployment Complete!"
echo "======================================"
echo ""
echo "Test on your site now:"
echo "1. Scroll during typing should work"
echo "2. No 'My training data ends April 2023'"
echo "3. No 'I want to start by acknowledging...'"
echo "4. Citations should be smaller"
echo "5. Democracy Now/Drop Site News prioritized"
echo ""
ENDSSH

echo "All done!"
echo ""
