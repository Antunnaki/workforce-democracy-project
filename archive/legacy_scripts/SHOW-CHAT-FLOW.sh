#!/bin/bash
# Show the complete chat flow in server.js

echo "=========================================="
echo "CHAT ENDPOINT FLOW (server.js)"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "📋 Showing lines 480-650 (the chat endpoint logic):"
echo ""
sed -n '480,650p' server.js | cat -n
echo ""

echo "=========================================="
