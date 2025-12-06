#!/bin/bash

# Script to check backend logs for troubleshooting AI assistant issues

echo "========================================="
echo "Workforce Democracy Project - Backend Log Checker"
echo "========================================="
echo ""

echo "Connecting to backend server..."
ssh root@185.193.126.13 << 'EOF'
echo "Connected to backend server"
echo ""
echo "Checking PM2 process list..."
pm2 list
echo ""
echo "Showing recent logs (last 50 lines)..."
pm2 logs backend --lines 50
echo ""
echo "Checking environment variables..."
cat /var/www/workforce-democracy/backend/.env | grep -E "(GROQ|API)" || echo "No API-related environment variables found"
echo ""
echo "Checking for common error patterns in logs..."
pm2 logs backend --lines 100 | grep -i "error\|fail\|exception\|groq\|401\|403\|unauthorized\|invalid" || echo "No obvious errors found in recent logs"
EOF

echo ""
echo "Done checking backend logs."
echo "If you see API key errors, you may need to update the GROQ_API_KEY in the backend .env file."