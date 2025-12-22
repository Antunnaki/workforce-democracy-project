#!/bin/bash

################################################################################
# ALTERNATIVE: Upload Pre-Edited Files to VPS Using SCP
# Use this if you prefer to edit files on your Mac and upload them
################################################################################

echo "═══════════════════════════════════════════════════"
echo "  ALTERNATIVE DEPLOYMENT METHOD - SCP Upload"
echo "═══════════════════════════════════════════════════"
echo ""
echo "⚠️  PREREQUISITE: Files must be edited on your Mac first!"
echo ""
echo "Files to upload:"
echo "  1. backend/models/UserBackup.js"
echo "  2. backend/routes/personalization.js"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Ask user to confirm files are ready
read -p "Have you edited both files on your Mac? (yes/no): " READY

if [ "$READY" != "yes" ]; then
    echo "❌ Please edit files first, then run this script again."
    exit 1
fi

echo ""
echo "📤 Uploading files to VPS..."
echo ""

# Upload UserBackup.js
echo "1️⃣  Uploading UserBackup.js..."
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION/backend/models/UserBackup.js" root@185.193.126.13:/var/www/workforce-backend/models/UserBackup.js

if [ $? -eq 0 ]; then
    echo "   ✅ UserBackup.js uploaded successfully"
else
    echo "   ❌ UserBackup.js upload failed!"
    exit 1
fi

echo ""

# Upload personalization.js
echo "2️⃣  Uploading personalization.js..."
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION/backend/routes/personalization.js" root@185.193.126.13:/var/www/workforce-backend/routes/personalization.js

if [ $? -eq 0 ]; then
    echo "   ✅ personalization.js uploaded successfully"
else
    echo "   ❌ personalization.js upload failed!"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ All files uploaded successfully!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🔄 Next steps:"
echo ""
echo "1. SSH into VPS:"
echo "   ssh root@185.193.126.13"
echo ""
echo "2. Restart PM2:"
echo "   /opt/nodejs/bin/pm2 restart workforce-backend"
echo ""
echo "3. Check logs:"
echo "   /opt/nodejs/bin/pm2 logs workforce-backend --lines 30"
echo ""
echo "4. Clear MongoDB database:"
echo "   mongosh"
echo "   use workforce_democracy"
echo "   db.userbackups.deleteMany({})"
echo "   db.userbackups.countDocuments()"
echo "   exit"
echo ""
echo "═══════════════════════════════════════════════════"
