#!/bin/bash

echo "🔍 Finding your project location..."
echo ""

# Check if we're in the right directory
if [ -f "backend/server-UPDATED-WITH-PERSONALIZATION.js" ]; then
    echo "✅ Found the personalization files!"
    echo ""
    echo "📂 Your current directory is:"
    pwd
    echo ""
    echo "📝 Use this path in upload commands:"
    echo "   $(pwd)"
    echo ""
    echo "📤 Your upload commands should be:"
    echo ""
    echo "Command 1:"
    echo "scp -P 22 \"$(pwd)/backend/server-UPDATED-WITH-PERSONALIZATION.js\" root@185.193.126.13:/var/www/workforce-democracy/backend/server.js"
    echo ""
    echo "Command 2:"
    echo "scp -P 22 \"$(pwd)/backend/routes/personalization.js\" root@185.193.126.13:/var/www/workforce-democracy/backend/routes/personalization.js"
else
    echo "❌ Can't find personalization files in current directory"
    echo ""
    echo "Your current directory is:"
    pwd
    echo ""
    echo "Please run this from your project root directory"
    echo ""
    echo "Try:"
    echo "  cd ~/Desktop"
    echo "  find . -name 'server-UPDATED-WITH-PERSONALIZATION.js' -type f"
fi
