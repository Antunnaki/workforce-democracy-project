#!/bin/bash

# UPDATE BACKEND FOR QWEN INTEGRATION
# This script updates the backend with the Qwen integration fixes

echo "🔧 UPDATING BACKEND FOR QWEN INTEGRATION"
echo "======================================"
echo ""

# SSH into the server and run the update commands
ssh root@185.193.126.13 << 'EOF'
echo "🔐 CONNECTED TO SERVER"

# Navigate to the backend directory
cd /var/www/workforce-democracy/backend

# Pull the latest changes from GitHub
echo "📥 PULLING LATEST CHANGES"
git pull origin main

# Install any new dependencies
echo "📦 INSTALLING DEPENDENCIES"
npm install

# Check if Qwen API key is set in .env
if grep -q "QWEN_API_KEY" .env; then
    echo "✅ QWEN_API_KEY already set in .env"
else
    echo "⚠️  QWEN_API_KEY not found in .env"
    echo "Please add your Qwen API key to the .env file:"
    echo "QWEN_API_KEY=your_actual_qwen_api_key_from_dashscope"
fi

# Restart the services
echo "🔄 RESTARTING SERVICES"
pm2 restart workforce-democracy-a
pm2 restart workforce-democracy-b

# Check service status
echo "📊 SERVICE STATUS"
pm2 list

echo "✅ BACKEND UPDATE COMPLETE"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Verify the services are running correctly"
echo "2. Test the chat functionality"
echo "3. Check logs if there are any issues:"
echo "   pm2 logs workforce-democracy-a"
EOF

echo ""
echo "✅ BACKEND UPDATE SCRIPT EXECUTED"
echo ""
echo "NEXT STEPS:"
echo "1. Wait a few moments for the services to restart"
echo "2. Test the chat functionality on the live site"
echo "3. Check the browser console for any errors"