# 🔍 VERIFY PUBLICATION NAME FIX

Run this to verify the fix was applied correctly:

```bash
cat > /var/www/workforce-democracy/VERIFY-PUBLICATION-FIX.sh << 'EOFSCRIPT'
#!/bin/bash
# Verify that publication names are in the prompt

echo "=========================================="
echo "VERIFYING PUBLICATION NAME FIX"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Checking source formatting (should show [result.source]):"
echo ""
grep -n "result.source.*result.title" ai-service.js | head -5
echo ""

echo "2️⃣ Checking publication name instructions:"
echo ""
grep -n "you MUST use the exact publication name shown in brackets" ai-service.js
echo ""

echo "3️⃣ Showing full source formatting section (lines 1280-1290):"
echo ""
sed -n '1280,1290p' ai-service.js | cat -n
echo ""

echo "4️⃣ Showing citation rules section (lines 1395-1415):"
echo ""
sed -n '1395,1415p' ai-service.js | cat -n
echo ""

echo "=========================================="
EOFSCRIPT

chmod +x /var/www/workforce-democracy/VERIFY-PUBLICATION-FIX.sh
bash /var/www/workforce-democracy/VERIFY-PUBLICATION-FIX.sh
```

**Paste the output here so I can see if the fix was applied correctly.**
