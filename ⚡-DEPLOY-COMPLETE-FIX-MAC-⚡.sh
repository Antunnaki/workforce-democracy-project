#!/bin/bash
# UPLOAD & DEPLOY COMPLETE FIX FROM MAC
# Version: 37.18.6

set -e

# VPS Connection Details
VPS_IP="185.193.126.13"
VPS_USER="root"
VPS_BACKEND_DIR="/var/www/workforce-democracy/version-b/backend"

# Local project path - UPDATE THIS!
LOCAL_BACKEND_DIR="./backend"  # Adjust if your backend folder is elsewhere

echo "⚡ UPLOADING & DEPLOYING COMPLETE FIX v37.18.6 ⚡"
echo "=============================================="

# 1. Upload fix files
echo ""
echo "📤 Step 1: Uploading files to VPS..."
echo "   From: ${LOCAL_BACKEND_DIR}"
echo "   To: ${VPS_USER}@${VPS_IP}:${VPS_BACKEND_DIR}"
echo ""

scp ${LOCAL_BACKEND_DIR}/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js ${VPS_USER}@${VPS_IP}:${VPS_BACKEND_DIR}/
scp ${LOCAL_BACKEND_DIR}/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh ${VPS_USER}@${VPS_IP}:${VPS_BACKEND_DIR}/

echo "✅ Files uploaded"

# 2. Execute deployment
echo ""
echo "🚀 Step 2: Executing deployment on VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'EOF'
cd /var/www/workforce-democracy/version-b/backend
chmod +x DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh
./DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh
EOF

echo ""
echo "=============================================="
echo "✅ COMPLETE FIX DEPLOYED SUCCESSFULLY v37.18.6"
echo ""
echo "🎯 NEXT STEPS:"
echo "  1. Wait 60 seconds for test query to complete"
echo "  2. SSH to VPS: ssh root@185.193.126.13"
echo "  3. Check result with the displayed jobId from deployment output"
echo ""
echo "  4. Test frontend: https://sxcrlfyt.gensparkspace.com"
echo "     - Enter ZIP: 12061"
echo "     - Ask: 'How has Chuck Schumer voted on healthcare?'"
echo "     - Expected: Citations ¹ ² ³ with Congress.gov bills"
