#!/bin/bash
# Upload and setup script for frontend deployment helper
# This script uploads all necessary files to the server and provides instructions for running the setup

echo "📤 Uploading frontend deployment helper files to server..."

# Upload the helper script
echo "📦 Uploading helper script..."
scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/TEMPLATES/wdp-frontend-deploy-helper.sh \
  deploy@185.193.126.13:/tmp/

# Upload the sudoers configuration
echo "📋 Uploading sudoers configuration..."
scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/sudoers-wdp-frontend-deploy \
  deploy@185.193.126.13:/tmp/

# Upload the setup script
echo "🔧 Uploading setup script..."
scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/setup-frontend-deploy.sh \
  deploy@185.193.126.13:/tmp/

echo "✅ All files uploaded successfully!"

echo ""
echo "=============================================="
echo "NEXT STEPS - RUN SETUP ON THE SERVER"
echo "=============================================="
echo ""
echo "1. SSH into the server:"
echo "   ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13"
echo ""
echo "2. Switch to root (requires password):"
echo "   sudo -s"
echo ""
echo "3. Run the setup script:"
echo "   chmod +x /tmp/setup-frontend-deploy.sh"
echo "   /tmp/setup-frontend-deploy.sh"
echo ""
echo "4. Exit from root and server:"
echo "   exit"
echo "   exit"
echo ""
echo "5. Test the deployment from your local machine:"
echo "   USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org VERIFY=1 \\"
echo "   FILES=\"index.html js/personalization-ui.js js/personalization-system.js data\" \\"
echo "   ./ops/DEPLOY_FRONTEND.sh"
echo ""