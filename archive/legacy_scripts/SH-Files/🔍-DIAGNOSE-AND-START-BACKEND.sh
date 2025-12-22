#!/bin/bash

###############################################################################
# 🔍 DIAGNOSE AND START BACKEND - Workforce Democracy Project
# Version: v37.9.2
# Created: 2025-01-11
# Purpose: Diagnose backend status and start PM2 process
###############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "🔍 WORKFORCE DEMOCRACY - BACKEND DIAGNOSTIC & STARTUP"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# STEP 1: Check current PM2 status
echo "📋 STEP 1: Checking current PM2 processes..."
pm2 list
echo ""

# STEP 2: Verify backend directory exists
echo "📁 STEP 2: Checking backend directory..."
if [ -d "/var/www/workforce-democracy/backend" ]; then
    echo "✅ Backend directory exists"
    ls -la /var/www/workforce-democracy/backend/
else
    echo "❌ ERROR: Backend directory not found!"
    echo "Expected location: /var/www/workforce-democracy/backend"
    exit 1
fi
echo ""

# STEP 3: Check for server.js entry point
echo "🔍 STEP 3: Checking for server.js entry point..."
if [ -f "/var/www/workforce-democracy/backend/server.js" ]; then
    echo "✅ server.js found"
else
    echo "❌ ERROR: server.js not found!"
    echo "Cannot start backend without entry point"
    exit 1
fi
echo ""

# STEP 4: Check Node.js version
echo "🟢 STEP 4: Checking Node.js version..."
node --version
npm --version
echo ""

# STEP 5: Check if .env file exists
echo "🔐 STEP 5: Checking for .env configuration..."
if [ -f "/var/www/workforce-democracy/backend/.env" ]; then
    echo "✅ .env file exists"
    echo "📄 .env file size:"
    ls -lh /var/www/workforce-democracy/backend/.env
else
    echo "⚠️  WARNING: .env file not found"
    echo "Backend may not have API keys configured"
fi
echo ""

# STEP 6: Check for node_modules
echo "📦 STEP 6: Checking for node_modules..."
if [ -d "/var/www/workforce-democracy/backend/node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "⚠️  WARNING: node_modules not found"
    echo "You may need to run: npm install"
fi
echo ""

# STEP 7: Start the backend process
echo "═══════════════════════════════════════════════════════════════════"
echo "🚀 STEP 7: STARTING BACKEND PROCESS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

cd /var/www/workforce-democracy/backend/

echo "📍 Current directory: $(pwd)"
echo "🚀 Starting PM2 process named 'backend'..."
echo ""

pm2 start server.js --name backend

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "🔄 Setting PM2 to auto-restart on system reboot..."
pm2 startup

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 FINAL STATUS CHECK"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

pm2 list

echo ""
echo "📜 Showing last 30 lines of backend logs..."
echo "═══════════════════════════════════════════════════════════════════"
pm2 logs backend --lines 30 --nostream

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ DIAGNOSTIC AND STARTUP COMPLETE"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📌 Next Steps:"
echo "   1. Check the logs above for any errors"
echo "   2. Verify backend is listening on port 3001"
echo "   3. Test API endpoint: curl http://185.193.126.13:3001/health"
echo ""
echo "📝 Useful Commands:"
echo "   - View live logs: pm2 logs backend"
echo "   - Restart backend: pm2 restart backend"
echo "   - Stop backend: pm2 stop backend"
echo "   - PM2 status: pm2 list"
echo ""
