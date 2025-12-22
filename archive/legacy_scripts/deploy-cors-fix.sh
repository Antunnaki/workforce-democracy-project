#!/bin/bash

# Deploy CORS Fix to Workforce Democracy Project Server
# This script copies the CORS fix files to your server and runs the fix

echo "🚀 Deploying CORS Fix to Workforce Democracy Project Server"
echo "========================================================="
echo ""

# Copy the CORS configuration file to the server
echo "📦 Copying CORS configuration to server..."
scp backend/nginx-cors-config.conf root@185.193.126.13:/tmp/

# Copy the fix script to the server
echo "📦 Copying fix script to server..."
scp fix-cors-automated.sh root@185.193.126.13:/tmp/

echo "✅ Files copied successfully!"
echo ""
echo "📋 Next steps (run these commands on your server):"
echo ""
echo "1. SSH into your server:"
echo "   ssh root@185.193.126.13"
echo ""
echo "2. Make the script executable:"
echo "   chmod +x /tmp/fix-cors-automated.sh"
echo ""
echo "3. Run the CORS fix:"
echo "   /tmp/fix-cors-automated.sh"
echo ""
echo "4. Exit the server:"
echo "   exit"
echo ""
echo "5. Test the connection again at:"
echo "   https://workforcedemocracyproject.org/test-backend-connection.html"