#!/bin/bash

###############################################################################
# INSTALL COOKIE-PARSER FOR SESSION SUPPORT
# 
# This script installs cookie-parser npm package for handling session cookies
# Required for Fire button / persistent login feature
#
# Usage: Run on VPS
# chmod +x install-cookie-parser.sh
# ./install-cookie-parser.sh
###############################################################################

echo "========================================="
echo "Installing cookie-parser for sessions"
echo "========================================="
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/backend

# Install cookie-parser
echo "📦 Installing cookie-parser..."
npm install cookie-parser

if [ $? -eq 0 ]; then
    echo "✅ cookie-parser installed successfully"
else
    echo "❌ Failed to install cookie-parser"
    exit 1
fi

# Restart backend with PM2
echo ""
echo "🔄 Restarting backend..."
/opt/nodejs/bin/pm2 restart backend

if [ $? -eq 0 ]; then
    echo "✅ Backend restarted successfully"
else
    echo "❌ Failed to restart backend"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ cookie-parser installation complete!"
echo "========================================="
echo ""
echo "Session cookies now supported!"
echo "Users can stay logged in even after Fire button usage."
echo ""
