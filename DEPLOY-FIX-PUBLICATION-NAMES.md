# 🚀 FIX: Publication Names in LLM Responses

## **THE PROBLEM:**

The LLM is inventing publication names from its training data:

| LLM Currently Says | Should Say (Based on Actual Sources) |
|-------------------|--------------------------------------|
| "According to **Democracy Now**..." [1] | "According to **Truthout**..." [1] |
| "**The Intercept** reports..." [2] | "**Common Dreams** reports..." [2] |
| "**ProPublica** notes..." [4] | ❌ Only 2 sources exist! |

**Root Cause:** The publication name (Truthout, Common Dreams) is **not in the LLM prompt**. The LLM only sees:

```
1. As SNAP Crisis Continues, Trump Whines... [TRUSTED]
   URL: https://truthout.org/...
```

It doesn't know that source [1] = **Truthout**, so it guesses publication names from its training.

---

## **THE FIX:**

1. **Add publication name to prompt:** `[Truthout] As SNAP Crisis Continues...`
2. **Add explicit instruction:** "When citing [1], use the EXACT publication name shown in brackets"

---

## **DEPLOYMENT COMMAND (Using Heredoc Method)**

Copy and paste this **ENTIRE BLOCK** into your SSH session:

```bash
cat > /var/www/workforce-democracy/FIX-SOURCE-PUBLICATION-NAMES.sh << 'EOFSCRIPT'
#!/bin/bash
###########################################
# FIX: Add Publication Names to LLM Prompt
# - Include source publication name (Truthout, Common Dreams, etc.) in prompt
# - Add explicit instruction to use ONLY those publication names
###########################################

set -e  # Exit on any error

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX: Add Publication Names to Prompt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUP
echo ""
echo "📦 Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-pre-pubnames-$TIMESTAMP.js"
echo "   ✅ Backup saved: ai-service-pre-pubnames-$TIMESTAMP.js"

# 2. FIX: Add publication name to source formatting (around line 1283)
echo ""
echo "🛠️  Step 2: Adding publication names to prompt..."

# Find and replace the source formatting line
# OLD: prompt += `${i+1}. ${result.title} ${result.trusted ? '[TRUSTED]' : ''}\n`;
# NEW: prompt += `${i+1}. [${result.source}] ${result.title} ${result.trusted ? '[TRUSTED]' : ''}\n`;

sed -i "s/prompt += \`\${i+1}\. \${result\.title} \${result\.trusted ? '\[TRUSTED\]' : ''}\\\n\`;/prompt += \`\${i+1}. [\${result.source}] \${result.title} \${result.trusted ? '[TRUSTED]' : ''}\\\n\`;/g" "$BACKEND_DIR/ai-service.js"

echo "   ✅ Added publication names to source formatting"

# 3. FIX: Add explicit instruction about publication names (after line 204)
echo ""
echo "🛠️  Step 3: Adding publication name instructions..."

# Add instruction after the CITATION RULES section
sed -i '/- If no source supports a claim, say "based on general knowledge" instead of inventing a citation/a\
  - When citing source [1], you MUST use the exact publication name shown in brackets: [Publication Name]\
  - Example: If you see "[Truthout]" in source [1], write "According to Truthout..." or "Truthout reports..." NOT "According to Democracy Now"\
  - DO NOT substitute different publication names from your training data (Democracy Now, The Intercept, ProPublica, etc.) unless they appear in the actual source list' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Added publication name instructions"

# 4. VERIFY CHANGES
echo ""
echo "🔍 Step 4: Verifying changes..."

echo ""
echo "   Checking for publication name in source formatting:"
if grep -q '\[${result.source}\]' "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Publication name added to prompt"
else
    echo "   ⚠️  WARNING: Publication name not found in source formatting!"
fi

echo ""
echo "   Checking for publication name instructions:"
if grep -q "you MUST use the exact publication name shown in brackets" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Publication name instructions added"
else
    echo "   ⚠️  WARNING: Instructions not found!"
fi

# 5. SHOW THE CHANGES
echo ""
echo "🔍 Step 5: Showing changes..."
echo ""
echo "   Source formatting (should show [Publication]):"
grep -A 2 "result.title" "$BACKEND_DIR/ai-service.js" | grep "prompt +="
echo ""

# 6. RESTART BACKEND WITH PM2 CACHE CLEAR
echo ""
echo "♻️  Step 6: Restarting backend (with PM2 cache clear)..."
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
echo "   1. ✅ Added publication names to source list: [Truthout], [Common Dreams], etc."
echo "   2. ✅ Added instruction: Use EXACT publication name from brackets"
echo "   3. ✅ Prevented substitution: No more 'According to Democracy Now' when source is Truthout"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 WATCH FOR:"
echo "   • LLM should say 'According to Truthout...' for source [1]"
echo "   • LLM should say 'Common Dreams reports...' for source [2]"
echo "   • NO MORE invented publication names (Democracy Now, The Intercept, etc.)"
echo "   • Publication names in chat should MATCH collapsible source menu"
echo ""
echo "💾 Backup location: $BACKUP_DIR/ai-service-pre-pubnames-$TIMESTAMP.js"
echo ""
EOFSCRIPT

chmod +x /var/www/workforce-democracy/FIX-SOURCE-PUBLICATION-NAMES.sh
bash /var/www/workforce-democracy/FIX-SOURCE-PUBLICATION-NAMES.sh
```

---

## **WHAT THIS CHANGES:**

### **Before (Current):**
```javascript
// Line 1283 (approximately)
prompt += `${i+1}. ${result.title} ${result.trusted ? '[TRUSTED]' : ''}\n`;
```

**LLM sees:**
```
1. As SNAP Crisis Continues, Trump Whines... [TRUSTED]
   URL: https://truthout.org/...
```
❌ No publication name! LLM guesses "Democracy Now"

### **After (Fixed):**
```javascript
// Line 1283 (approximately)
prompt += `${i+1}. [${result.source}] ${result.title} ${result.trusted ? '[TRUSTED]' : ''}\n`;
```

**LLM sees:**
```
1. [Truthout] As SNAP Crisis Continues, Trump Whines... [TRUSTED]
   URL: https://truthout.org/...

2. [Common Dreams] US: Millions Face Soaring Health Costs... [TRUSTED]
   URL: https://www.commondreams.org/...
```
✅ Publication name in brackets! LLM knows to use "Truthout" and "Common Dreams"

**Plus new instruction:**
```
- When citing source [1], you MUST use the exact publication name shown in brackets: [Publication Name]
- Example: If you see "[Truthout]" in source [1], write "According to Truthout..." NOT "According to Democracy Now"
- DO NOT substitute different publication names from your training data
```

---

## **EXPECTED RESULT:**

### **Before Fix:**
```
According to Democracy Now, the proposed changes to SNAP... [1]
The Intercept reports that these changes... [2]
ProPublica notes that the proposed changes... [4]  ❌ Doesn't exist!
```

Sources shown:
1. Truthout ❌ Mismatch!
2. Common Dreams ❌ Mismatch!

### **After Fix:**
```
According to Truthout, the proposed changes to SNAP... [1]
Common Dreams reports that these changes... [2]
```

Sources shown:
1. Truthout ✅ Match!
2. Common Dreams ✅ Match!

---

## **IF SOMETHING GOES WRONG:**

Restore from backup:
```bash
cp /var/www/workforce-democracy/backups/ai-service-pre-pubnames-[TIMESTAMP].js /var/www/workforce-democracy/backend/ai-service.js
pm2 restart backend
```

---

**Ready to deploy? Copy the entire heredoc block above and paste it into your VPS terminal!** 🚀
