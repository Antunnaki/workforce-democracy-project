# 🔍 GET PROMPT INFORMATION

## **Run this on your VPS to see how sources are passed to the LLM:**

```bash
cat > /var/www/workforce-democracy/GET-FULL-PROMPT-SECTION.sh << 'EOFSCRIPT'
#!/bin/bash
# Show the full prompt construction section to identify how sources are formatted

echo "=========================================="
echo "SHOWING PROMPT CONSTRUCTION SECTION"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

# Find where sources are added to the prompt
echo "1️⃣ Searching for where sources are formatted in the prompt..."
echo ""
grep -n "sources.forEach\|sources.map\|Source \[" ai-service.js | head -20

echo ""
echo "=========================================="
echo ""

# Show the buildSystemPrompt function (around lines 1250-1450)
echo "2️⃣ Showing buildSystemPrompt function (lines 1200-1500)..."
echo ""
sed -n '1200,1500p' ai-service.js | cat -n

echo ""
echo "=========================================="
echo ""

# Find analyzeWithAI function
echo "3️⃣ Searching for analyzeWithAI function..."
echo ""
grep -n "async function analyzeWithAI\|function analyzeWithAI" ai-service.js

echo ""
echo "=========================================="
echo ""
EOFSCRIPT

chmod +x /var/www/workforce-democracy/GET-FULL-PROMPT-SECTION.sh
bash /var/www/workforce-democracy/GET-FULL-PROMPT-SECTION.sh
```

## **What to do:**

1. Copy the entire block above
2. Paste into your SSH session on the VPS
3. Paste the output here

This will show me how sources are being formatted when sent to the LLM, so I can fix the hallucinated publication names.

---

## **The Issue:**

The LLM is seeing something like:
```
[1] Truthout: "As SNAP Crisis Continues..."
[2] Common Dreams: "US: Millions Face Soaring Health Costs..."
```

But then writing:
```
"According to Democracy Now..." [1]  ❌ WRONG - Should say "According to Truthout"
"The Intercept reports..." [2]        ❌ WRONG - Should say "According to Common Dreams"
```

Once I see how the sources are formatted in the prompt, I can add an instruction like:

```
CRITICAL: When citing source [1], you MUST say "Truthout" (not Democracy Now, not any other publication).
When citing source [2], you MUST say "Common Dreams" (not The Intercept, not any other publication).
DO NOT substitute different publication names from your training data.
```
