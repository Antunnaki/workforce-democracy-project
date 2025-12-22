#!/bin/bash
# Simplified server setup script

# Upload all necessary files
echo "📤 Uploading files to server..."
scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/TEMPLATES/wdp-frontend-deploy-helper.sh \
  deploy@185.193.126.13:/tmp/

scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/sudoers-wdp-frontend-deploy \
  deploy@185.193.126.13:/tmp/

scp -i ~/.ssh/id_ed25519_njalla \
  /Users/acejrowski/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/Workforce\ Democracy\ Project/ops/setup-frontend-deploy.sh \
  deploy@185.193.126.13:/tmp/

echo "✅ Files uploaded!"

echo ""
echo "=============================================="
echo "NEXT: SERVER ADMIN TO RUN THIS ON VPS AS ROOT"
echo "=============================================="
echo ""
echo "1. SSH to server:"
echo "   ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13"
echo ""
echo "2. Become root:"
echo "   sudo -s"
echo ""
echo "3. Run setup:"
echo "   chmod +x /tmp/setup-frontend-deploy.sh"
echo "   /tmp/setup-frontend-deploy.sh"
echo ""
echo "4. Exit server sessions:"
echo "   exit  # exit root"
echo "   exit  # exit SSH"
echo ""
echo "5. Test from your Mac:"
echo "   USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org VERIFY=1 \\"
echo "   FILES=\"index.html js/personalization-ui.js js/personalization-system.js data\" \\"
echo "   ./ops/DEPLOY_FRONTEND.sh"
echo ""