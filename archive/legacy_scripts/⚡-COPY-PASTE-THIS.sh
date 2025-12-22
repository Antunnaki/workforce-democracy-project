#!/bin/bash

# ⚡ COPY-PASTE THIS - v37.5.0 Verification
# This is the simplest possible way to test v37.5.0

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  ⚡ Running v37.5.0 Citation Fix Verification             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Run the verification script
ssh root@185.193.126.13 << 'ENDSSH'
cd /var/www/workforce-democracy/backend

# Run verification
bash VERIFY-v37.5.0-COMPLETE.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  📊 VERIFICATION COMPLETE                                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "NEXT STEP: Test the chat"
echo ""
echo "1. Open https://workforcedemocracy.org"
echo "2. Press F12 (open console)"
echo "3. Ask: 'What happens if SNAP benefits are cut?'"
echo ""
echo "Expected backend logs:"
echo "  🔍 Pre-searching sources before LLM call..."
echo "  ✅ Providing 3 validated sources to LLM"
echo ""
echo "To watch logs in real-time, run:"
echo "  ssh root@185.193.126.13"
echo "  pm2 logs backend --lines 0"
echo ""
ENDSSH
