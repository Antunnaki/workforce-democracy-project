#!/bin/bash

echo "=== Checking Version B Status ==="
echo ""

echo "1. Service Status:"
sudo systemctl status workforce-backend-b.service | head -10
echo ""

echo "2. Check if file exists:"
ls -lh /var/www/workforce-democracy/version-b/backend/civic-llm-async.js
echo ""

echo "3. Check recent logs:"
tail -20 /var/log/workforce-backend-b.log
echo ""

echo "4. Test if Version B is responding:"
curl -s http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}' | head -5
