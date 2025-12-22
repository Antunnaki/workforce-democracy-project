# Diagnostic Analysis for AI Service Integration

## Summary of Your Request

You want to implement 3 critical features to fix the AI assistant's source problem:

### **Primary Goal**: Get AI to provide detailed, evidence-based policy analysis instead of hallucinating sources

### **3 Required Features**:

1. **Article Scraping** ✅ CREATED
   - Module: `article-scraper.js` (11,831 bytes)
   - Status: File exists, import added to ai-service.js
   - Function: Fetches FULL article text (2,000-10,000 chars) from progressive sources

2. **Iterative Search** ❌ NOT ADDED
   - Gap analysis detects insufficient sources
   - Automatically generates 2-3 follow-up queries
   - Should execute AFTER initial source search

3. **Music Filter** ❌ NOT ADDED
   - Filters out entertainment articles
   - Should run in `scoreSourceRelevance()` function
   - Needs to be AFTER `combined` variable is defined

---

## Current Problem

**The deployment script keeps failing** because it's looking for this pattern:
```javascript
if (needsCurrentInfo(query, '')) {
    console.log('🔍 Pre-searching for sources before LLM call...');
    sources = await searchAdditionalSources(query, '');
```

**This pattern doesn't exist** in your backup file (from before source search was integrated).

---

## Next Steps

You need to run these commands on the server to find WHERE source searching actually happens:

```bash
cd /var/www/workforce-democracy/backend

# Find analyzeWithAI function structure
echo "=== ANALYZING analyzeWithAI FUNCTION ==="
sed -n '/^async function analyzeWithAI/,/^}/p' ai-service.js | grep -A5 -B5 "sources.*=.*await\|searchAdditional"

# Find scoreSourceRelevance function
echo "=== ANALYZING scoreSourceRelevance FUNCTION ==="
sed -n '/^function scoreSourceRelevance/,/^}/p' ai-service.js | grep -A2 -B2 "combined.*="

# Search for any source-related patterns
echo "=== SEARCHING FOR SOURCE PATTERNS ==="
grep -n "sources.*=\|searchAdditional\|needsCurrentInfo" ai-service.js
```

Once we see the ACTUAL structure, I can adapt the insertion script to work with your real code instead of the assumed pattern.

---

## Why This Matters

Your AI is currently:
- ❌ Hallucinating sources (ProPublica, OpenSecrets) without URLs
- ❌ Only getting 3 sources instead of 10-15
- ❌ Not scraping full article content (short excerpts only)
- ❌ Not doing follow-up searches when sources are insufficient
- ❌ Still showing music articles in results

All of this is fixable once we see the actual code structure!
