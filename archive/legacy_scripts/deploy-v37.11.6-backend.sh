#!/bin/bash
# 🚀 Deploy v37.11.6 Backend Encryption Fix
# This script uploads the fixed personalization.js to VPS and restarts the backend

echo "🚀 Deploying v37.11.6 Backend Encryption Fix..."
echo ""

# Check if file exists
if [ ! -f "backend/routes/personalization.js" ]; then
    echo "❌ Error: backend/routes/personalization.js not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Upload file to VPS
echo "📤 Uploading personalization.js to VPS..."
scp backend/routes/personalization.js root@workforcedemocracyproject.org:/var/www/wdp-backend/routes/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed! Please check your SSH connection."
    exit 1
fi

echo "✅ File uploaded successfully!"
echo ""

# Restart backend via SSH
echo "🔄 Restarting backend..."
ssh root@workforcedemocracyproject.org "pm2 restart wdp-backend && pm2 logs wdp-backend --lines 20"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test registration: PersonalizationSystem.register('test', 'Test123!')"
echo "2. Make a change and verify sync works"
echo "3. Test Fire button recovery"
echo ""
echo "🔍 Monitor logs: ssh root@workforcedemocracyproject.org 'pm2 logs wdp-backend'"
