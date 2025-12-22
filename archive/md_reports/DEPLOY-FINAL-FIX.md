# 🚀 DEPLOY FINAL FIX - LLM Hallucination Fix

## **What This Fixes:**
1. ❌ Removes "End with Sources section" (causing plain-text list)
2. ✅ Adds explicit "DO NOT HALLUCINATE" instructions to LLM
3. 📈 Increases source count from 10 to 15
4. 🎯 Stops LLM from citing: Center on Budget, Feeding America, Economic Policy Institute, etc.

---

## **DEPLOYMENT COMMAND (Using Heredoc Method)**

Copy and paste this **ENTIRE BLOCK** into your SSH session on the VPS:

```bash
cat > /var/www/workforce-democracy/FINAL-FIX-LLM-HALLUCINATION.sh << 'EOFSCRIPT'
#!/bin/bash
###########################################
# FINAL FIX: Stop LLM Source Hallucination
# - Remove "End with Sources section" (line 1404/57 in output)
# - Add explicit "DO NOT HALLUCINATE" instructions
# - Increase source count 10 → 15
###########################################

set -e  # Exit on any error

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FINAL FIX: LLM Source Hallucination"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUP
echo ""
echo "📦 Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-v37.7.0-$TIMESTAMP.js"
echo "   ✅ Backup saved: ai-service-v37.7.0-$TIMESTAMP.js"

# 2. VERIFY FILE EXISTS
echo ""
echo "🔍 Step 2: Verifying file..."
if [ ! -f "$BACKEND_DIR/ai-service.js" ]; then
    echo "   ❌ ERROR: ai-service.js not found!"
    exit 1
fi
echo "   ✅ File found"

# 3. FIX #1: Remove "End with Sources section" (line ~1404)
echo ""
echo "🛠️  Step 3: Removing 'End with Sources section'..."
sed -i 's/Write as one flowing analytical response that presents facts clearly and helps users discover truth\. End with Sources section\./Write as one flowing analytical response that presents facts clearly and helps users discover truth. Use ONLY the sources provided above - DO NOT cite organizations or reports not explicitly listed./g' "$BACKEND_DIR/ai-service.js"
echo "   ✅ Removed hallucination trigger"

# 4. FIX #2: Add explicit anti-hallucination instructions after line with "CURRENT INFORMATION:"
echo ""
echo "🛠️  Step 4: Adding explicit citation constraints..."

# This adds the new instructions right after the "CURRENT INFORMATION:" section
sed -i '/^CURRENT INFORMATION:/a\
• **CITATION RULES (CRITICAL):**\
  - ONLY cite sources numbered [1], [2], [3], etc. from the list provided above\
  - DO NOT cite: Center on Budget and Policy Priorities, Feeding America, Economic Policy Institute, Urban Institute, or ANY organization not in the numbered source list\
  - DO NOT invent citations from your training data\
  - If you mention a statistic or fact, it MUST come from the numbered sources above\
  - If no source supports a claim, say "based on general knowledge" instead of inventing a citation' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Added anti-hallucination instructions"

# 5. FIX #3: Increase maxSources from 10 to 15
echo ""
echo "🛠️  Step 5: Increasing source count 10 → 15..."
sed -i 's/const maxSources = 10;/const maxSources = 15;/g' "$BACKEND_DIR/ai-service.js"
sed -i 's/filterAndSortSources(allSources, userMessage, 10)/filterAndSortSources(allSources, userMessage, 15)/g' "$BACKEND_DIR/ai-service.js"
echo "   ✅ Increased to 15 sources"

# 6. VERIFY CHANGES
echo ""
echo "🔍 Step 6: Verifying changes..."

echo ""
echo "   Checking for removed 'End with Sources section':"
if grep -q "End with Sources section" "$BACKEND_DIR/ai-service.js"; then
    echo "   ⚠️  WARNING: 'End with Sources section' still found!"
else
    echo "   ✅ Successfully removed"
fi

echo ""
echo "   Checking for new anti-hallucination instructions:"
if grep -q "DO NOT cite: Center on Budget" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Anti-hallucination instructions added"
else
    echo "   ⚠️  WARNING: Instructions not found!"
fi

echo ""
echo "   Checking for increased source count:"
if grep -q "const maxSources = 15;" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ maxSources increased to 15"
else
    echo "   ⚠️  WARNING: maxSources not updated!"
fi

# 7. RESTART BACKEND WITH PM2 CACHE CLEAR
echo ""
echo "♻️  Step 7: Restarting backend (with PM2 cache clear)..."
pm2 stop backend
pm2 flush
pm2 delete backend
sleep 2
cd "$BACKEND_DIR/.."
pm2 start backend/server.js --name backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ❌ Removed 'End with Sources section' trigger"
echo "   2. ✅ Added explicit anti-hallucination instructions"
echo "   3. 📈 Increased source count from 10 to 15"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 WATCH FOR:"
echo "   • Backend should find 3-5+ SNAP sources (not just 1-2)"
echo "   • LLM should ONLY cite provided sources (no Center on Budget, Feeding America, etc.)"
echo "   • NO plain-text 'Sources:' list at end"
echo "   • Citations [1], [2], [3] should match backend-provided sources"
echo ""
echo "💾 Backup location: $BACKUP_DIR/ai-service-v37.7.0-$TIMESTAMP.js"
echo ""
EOFSCRIPT

chmod +x /var/www/workforce-democracy/FINAL-FIX-LLM-HALLUCINATION.sh
bash /var/www/workforce-democracy/FINAL-FIX-LLM-HALLUCINATION.sh
```

---

## **EXPECTED OUTPUT:**

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 FINAL FIX: LLM Source Hallucination
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Step 1: Creating backup...
   ✅ Backup saved: ai-service-v37.7.0-20250108_XXXXXX.js

🔍 Step 2: Verifying file...
   ✅ File found

🛠️  Step 3: Removing 'End with Sources section'...
   ✅ Removed hallucination trigger

🛠️  Step 4: Adding explicit citation constraints...
   ✅ Added anti-hallucination instructions

🛠️  Step 5: Increasing source count 10 → 15...
   ✅ Increased to 15 sources

🔍 Step 6: Verifying changes...
   ✅ Successfully removed
   ✅ Anti-hallucination instructions added
   ✅ maxSources increased to 15

♻️  Step 7: Restarting backend (with PM2 cache clear)...
[PM2 logs showing successful restart]

✅ DEPLOYMENT COMPLETE!
```

---

## **AFTER DEPLOYMENT - TEST:**

1. Go to your Workforce Democracy chat interface
2. Ask: **"What are the latest attacks on SNAP benefits?"**
3. Open browser console (F12)
4. Watch for:
   - ✅ Backend finds 3-5+ sources (not just 1-2)
   - ✅ LLM cites ONLY provided sources (no hallucinated orgs)
   - ✅ NO plain-text "Sources:" list at end
   - ✅ All citations [1], [2], [3] are clickable

---

## **IF SOMETHING GOES WRONG:**

Restore from backup:
```bash
cp /var/www/workforce-democracy/backups/ai-service-v37.7.0-[TIMESTAMP].js /var/www/workforce-democracy/backend/ai-service.js
pm2 restart backend
```

---

## **WHY THIS FIXES THE PROBLEM:**

### **Before:**
```javascript
Write as one flowing analytical response that presents facts clearly and helps users discover truth. End with Sources section.
```
- LLM thinks it needs to create a "Sources section"
- Invents citations from training data (Center on Budget, Feeding America, etc.)
- Creates plain-text list at end

### **After:**
```javascript
Write as one flowing analytical response that presents facts clearly and helps users discover truth. Use ONLY the sources provided above - DO NOT cite organizations or reports not explicitly listed.

• **CITATION RULES (CRITICAL):**
  - ONLY cite sources numbered [1], [2], [3], etc. from the list provided above
  - DO NOT cite: Center on Budget and Policy Priorities, Feeding America, Economic Policy Institute, Urban Institute, or ANY organization not in the numbered source list
  - DO NOT invent citations from your training data
  - If you mention a statistic or fact, it MUST come from the numbered sources above
  - If no source supports a claim, say "based on general knowledge" instead of inventing a citation
```
- LLM understands it MUST use only provided sources
- Explicitly forbidden from citing hallucinated organizations
- No "Sources section" instruction = no plain-text list

---

**This is the heredoc method you requested documented! 🎉**
