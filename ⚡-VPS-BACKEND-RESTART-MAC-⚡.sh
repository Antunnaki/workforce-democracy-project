#!/bin/bash
# ⚡ Workforce Democracy VPS Backend - Quick Restart from Mac ⚡
# 
# USAGE FROM YOUR MAC TERMINAL:
# 1. Copy this ENTIRE file
# 2. Open Terminal on your Mac
# 3. Paste and press Enter
# 
# This will SSH into your VPS and restart the backend services
# ========================================================================

echo "🚀 Connecting to Workforce Democracy VPS..."
echo "Server: 185.193.126.13"
echo ""

ssh root@185.193.126.13 << 'ENDSSH'

# ========================================================================
# VPS BACKEND HEALTH CHECK & RESTART
# This runs on the VPS automatically after SSH connection
# ========================================================================

echo "======================================================"
echo "  🏛️  Workforce Democracy Backend Health Check"
echo "======================================================"
echo ""

# Navigate to backend directory
cd /root/workforce-democracy-backend || {
    echo "❌ Backend directory not found!"
    echo "Expected: /root/workforce-democracy-backend"
    exit 1
}

echo "📁 Working directory: $(pwd)"
echo ""

# Check current PM2 status
echo "📊 Current PM2 Process Status:"
echo "------------------------------------------------------"
pm2 status
echo ""

# Check if any processes are running
RUNNING_COUNT=$(pm2 jlist | jq -r '.[] | select(.pm2_env.status == "online") | .name' | wc -l)
STOPPED_COUNT=$(pm2 jlist | jq -r '.[] | select(.pm2_env.status == "stopped") | .name' | wc -l)

echo "✅ Running processes: $RUNNING_COUNT"
echo "⚠️  Stopped processes: $STOPPED_COUNT"
echo ""

# Ask user if they want to restart
echo "🔄 Restarting all backend services (Nuclear restart)..."
echo ""

# Nuclear restart - clears Node.js module cache
pm2 restart all --update-env

# Wait for services to stabilize
echo "⏳ Waiting 3 seconds for services to stabilize..."
sleep 3
echo ""

# Check new status
echo "======================================================"
echo "  📊 Post-Restart Status"
echo "======================================================"
pm2 status
echo ""

# Show recent logs (last 15 lines, no streaming)
echo "======================================================"
echo "  📋 Recent Backend Logs"
echo "======================================================"
pm2 logs --lines 15 --nostream
echo ""

# Health check summary
echo "======================================================"
echo "  ✅ Restart Complete!"
echo "======================================================"
echo ""
echo "🧪 Test your backend endpoints:"
echo ""
echo "  Health Check:"
echo "  curl https://api.workforcedemocracyproject.org/api/civic/llm-health"
echo ""
echo "  Chat Test (POST):"
echo "  curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\":\"Hello\",\"context\":\"general\"}'"
echo ""
echo "======================================================"
echo "  📊 Quick PM2 Commands"
echo "======================================================"
echo ""
echo "  View logs live:        pm2 logs"
echo "  Restart all:           pm2 restart all"
echo "  Stop all:              pm2 stop all"
echo "  Delete all processes:  pm2 delete all"
echo "  Save PM2 config:       pm2 save"
echo ""
echo "======================================================"
echo ""

ENDSSH

echo ""
echo "✅ VPS backend restart complete!"
echo "🌐 Frontend: https://workforcedemocracyproject.org"
echo "🔌 Backend:  https://api.workforcedemocracyproject.org"
echo ""
