#!/bin/bash
# QUICK FIX COMMANDS FOR V36.5.1 ISSUES
# Run these commands on your VPS to fix CORS and backend issues

echo "==================================================================="
echo "  WORKFORCE DEMOCRACY PROJECT - V36.5.1 URGENT FIXES"
echo "==================================================================="
echo ""

# Step 1: Backup current server.js
echo "Step 1: Backing up current server.js..."
cd /var/www/workforce-democracy/backend
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"
echo ""

# Step 2: Download updated server.js from your Mac
echo "Step 2: You need to upload the updated server.js"
echo "From your Mac terminal, run:"
echo ""
echo "scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
echo ""
echo "Press Enter when done..."
read

# Step 3: Verify Groq SDK is installed
echo "Step 3: Checking Groq SDK installation..."
if npm list groq-sdk > /dev/null 2>&1; then
    echo "✅ Groq SDK is installed"
else
    echo "⚠️ Groq SDK not found - installing..."
    npm install groq-sdk
    echo "✅ Groq SDK installed"
fi
echo ""

# Step 4: Verify environment variables
echo "Step 4: Checking environment variables..."
if grep -q "GROQ_API_KEY" .env; then
    echo "✅ GROQ_API_KEY found in .env"
else
    echo "❌ GROQ_API_KEY missing in .env!"
    echo "Add this line to .env:"
    echo "GROQ_API_KEY=[REDACTED_GROQ_API_KEY]"
fi

if grep -q "FRONTEND_URL" .env; then
    echo "✅ FRONTEND_URL found in .env"
    echo "Current value:"
    grep "FRONTEND_URL" .env
else
    echo "❌ FRONTEND_URL missing in .env!"
fi
echo ""

# Step 5: Restart PM2
echo "Step 5: Restarting backend server..."
pm2 restart workforce-backend
echo "✅ Server restarted"
echo ""

# Step 6: Check logs
echo "Step 6: Checking recent logs..."
pm2 logs workforce-backend --lines 20 --nostream
echo ""

# Step 7: Test health endpoint
echo "Step 7: Testing health endpoint..."
curl -s http://localhost:3001/health
echo ""
echo ""

# Step 8: Test with CORS headers
echo "Step 8: Testing with Netlify origin..."
curl -s -H "Origin: https://workforcedemocracyproject.netlify.app" \
     http://localhost:3001/health
echo ""
echo ""

echo "==================================================================="
echo "  FIXES COMPLETE"
echo "==================================================================="
echo ""
echo "Next steps:"
echo "1. Test your Netlify site: https://workforcedemocracyproject.netlify.app"
echo "2. Try Supreme Court chat: 'What is Roe v Wade?'"
echo "3. Check browser console (F12) for errors"
echo "4. Monitor PM2 logs: pm2 logs workforce-backend"
echo ""
echo "If still having issues, check URGENT-FIXES-V36.5.1.md"
echo "==================================================================="
