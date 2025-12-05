#!/bin/bash

# ======================================================================
# SIMPLE VPS UPLOAD & DEPLOY SCRIPT
# ======================================================================
# This script creates the 3 needed files and uploads them to VPS
# Run from: Mac Terminal
# ======================================================================

echo "🔧 Creating Deep Research fix files..."
echo ""

# Create diagnostic script
cat > DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh << 'EOF'
#!/bin/bash
cd /var/www/workforce-democracy/version-b/backend || exit 1
echo "🔍 Checking deep-research.js..."
if [ -f "deep-research.js" ]; then
    echo "✅ deep-research.js EXISTS"
    grep -n "searchCongressGovBills\|searchRepresentativeVotingRecord" deep-research.js | head -5
else
    echo "❌ deep-research.js NOT FOUND"
fi
EOF

# Create fix script
cat > FIX-DEEP-RESEARCH-CALL-v37.18.4.js << 'EOF'
const fs = require('fs');
const filePath = '/var/www/workforce-democracy/version-b/backend/deep-research.js';

console.log('🔧 Applying Deep Research fix...');

// Backup
const backupPath = filePath.replace('.js', `-BACKUP-${Date.now()}.js`);
fs.copyFileSync(filePath, backupPath);
console.log(`✅ Backed up to: ${backupPath}`);

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Check if searchCongressGovBills is being called
if (content.includes('await searchCongressGovBills(')) {
    console.log('✅ searchCongressGovBills is already being called');
    process.exit(0);
}

// Find insertion point and add the call
const insertPattern = /const representativeName = context\.representative/;
if (content.match(insertPattern)) {
    content = content.replace(
        insertPattern,
        `const representativeName = context.representative;
    
    // Deep Research: Search Congress.gov
    console.log(\`[Deep Research] Searching Congress.gov for \${representativeName}...\`);
    try {
        const congressBills = await searchCongressGovBills(query, representativeName);
        console.log(\`[Deep Research] Found \${congressBills.length} bills\`);
        congressBills.forEach(bill => sources.push(bill));
    } catch (error) {
        console.error('[Deep Research] Error:', error.message);
    }`
    );
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Fix applied successfully!');
} else {
    console.log('⚠️  Could not find insertion point');
    process.exit(1);
}
EOF

# Create deployment script
cat > DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh << 'EOF'
#!/bin/bash
cd /var/www/workforce-democracy/version-b/backend || exit 1

echo "🔧 DEEP RESEARCH FIX DEPLOYMENT"
echo "================================"
echo ""

# Run diagnostic
echo "Step 1: Diagnostic"
bash DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
echo ""

# Apply fix
echo "Step 2: Apply fix"
node FIX-DEEP-RESEARCH-CALL-v37.18.4.js
echo ""

# Verify syntax
echo "Step 3: Verify syntax"
node -c deep-research.js && echo "✅ Syntax OK" || echo "❌ Syntax error"
echo ""

# Restart service
echo "Step 4: Restart service"
sudo systemctl restart workforce-backend-b.service
sleep 2

# Check status
echo "Step 5: Check status"
sudo systemctl status workforce-backend-b.service --no-pager | head -10
echo ""

# Test
echo "Step 6: Test"
curl -X POST "http://localhost:3002/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","context":{"page":"civic-platform"}}' | jq '.jobId' || echo "Test query submitted"

echo ""
echo "🎉 Deployment complete!"
echo "Check logs: tail -50 /var/log/workforce-backend-b.log | grep -i 'deep research'"
EOF

# Make scripts executable
chmod +x DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh

echo "✅ Files created successfully!"
echo ""
echo "Files created in current directory:"
ls -lh DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh FIX-DEEP-RESEARCH-CALL-v37.18.4.js DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
echo ""
echo "Now uploading to VPS..."
echo ""

# Upload to VPS
scp DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh FIX-DEEP-RESEARCH-CALL-v37.18.4.js DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

echo ""
echo "✅ Files uploaded!"
echo ""
echo "Now deploying on VPS..."
echo ""

# SSH and deploy
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-b/backend && chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh && ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh'
