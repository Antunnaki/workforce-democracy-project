#!/bin/bash

# 🚀 RUN THIS DIRECTLY ON THE SERVER
# You're already on the server, so no SSH needed!

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🚀 Running v37.5.0 Verification (Direct on Server)       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Make sure we're in the right directory
cd /var/www/workforce-democracy/backend

# Make scripts executable
chmod +x VERIFY-v37.5.0-COMPLETE.sh
chmod +x test-v37.5.0-citation-fix.sh
chmod +x diagnose-citation-fix.sh

# Run verification
bash VERIFY-v37.5.0-COMPLETE.sh
