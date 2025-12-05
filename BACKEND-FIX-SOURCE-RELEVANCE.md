# 🔧 Backend Fix - Source Relevance & Diversity

## 🎯 Problems to Fix

1. **Guardian API returns irrelevant articles** - Not matching user's question
2. **Only Guardian sources** - Need RSS feeds from other outlets too
3. **All citations should be clickable** - Already working! ✅

---

## 📋 Backend Changes Needed

### File: `/var/www/workforce-democracy/backend/ai-service.js`

### Issue 1: Guardian API Search Query

**Current Problem:**
The Guardian API is being called but returning irrelevant results for questions like:
- "What would be societal implications if the 19th amendment is repealed?"
- Returns: Articles about politicians, Thames Water, Oasis (completely unrelated!)

**Root Cause:**
The search query sent to Guardian API might be:
- Too broad
- Using wrong keywords
- Not extracting key topics from user question

**Fix Needed:**
```javascript
// BEFORE (Lines ~1179-1195) - Current code
searchPromises.push(
    rssService.getGlobalNewsSources(userMessage, {
        maxSources: 5,
        prioritizeIndependent: true
    })
);

// The issue is in rssService.getGlobalNewsSources()
// It needs better keyword extraction from userMessage
```

**Better Approach:**
```javascript
// Extract key topics from user question
function extractSearchKeywords(userMessage) {
    // For "19th amendment repealed" question:
    // Should extract: "19th amendment", "women's suffrage", "voting rights"
    
    const keywords = [];
    
    // Detect constitutional amendments
    const amendmentMatch = userMessage.match(/(\d+)(?:st|nd|rd|th)\s+amendment/i);
    if (amendmentMatch) {
        const amendmentNum = amendmentMatch[1];
        const amendmentTopics = {
            '19': ['women suffrage', 'voting rights', 'women rights'],
            '1': ['free speech', 'freedom of religion', 'first amendment'],
            '2': ['gun rights', 'second amendment', 'firearms'],
            // Add more...
        };
        keywords.push(...(amendmentTopics[amendmentNum] || []));
    }
    
    // Detect policy topics
    if (userMessage.match(/mayor|mayoral/i)) {
        keywords.push('mayoral election', 'local government', 'city politics');
    }
    
    // Fall back to extracting nouns/key phrases
    const importantWords = userMessage
        .replace(/what|would|could|should|if|the|a|an|be|is/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    keywords.push(...importantWords);
    
    return keywords.join(' OR ');
}

// Then use in Guardian API call:
const searchQuery = extractSearchKeywords(userMessage);
searchPromises.push(
    rssService.getGlobalNewsSources(searchQuery, {
        maxSources: 5,
        prioritizeIndependent: true,
        userMessage: userMessage  // Pass original for context
    })
);
```

### Issue 2: Add RSS Feeds from Multiple Sources

**Current:** Only Guardian API

**Needed:** RSS feeds from:
- Breaking Points
- The Intercept  
- ProPublica
- Reuters
- AP News
- NPR
- BBC
- Local news outlets

**Fix in `/var/www/workforce-democracy/backend/rss-service.js`:**

```javascript
// Add RSS feed sources
const RSS_FEEDS = {
    breakingPoints: 'https://breakingpoints.com/feed/',
    theIntercept: 'https://theintercept.com/feed/',
    propublica: 'https://www.propublica.org/feeds/propublica/main',
    reuters: 'https://www.reutersagency.com/feed/',
    apNews: 'https://feeds.apnews.com/rss/apf-topnews',
    npr: 'https://feeds.npr.org/1001/rss.xml',
    bbc: 'http://feeds.bbci.co.uk/news/rss.xml'
};

async function getGlobalNewsSources(searchQuery, options = {}) {
    const sources = [];
    
    // 1. Try Guardian API first (2 sources max)
    const guardianResults = await searchGuardianAPI(searchQuery);
    sources.push(...guardianResults.slice(0, 2));
    
    // 2. Search RSS feeds (3 sources max)
    const rssResults = await searchRSSFeeds(searchQuery, RSS_FEEDS);
    sources.push(...rssResults.slice(0, 3));
    
    // 3. Mix and prioritize by relevance
    return sources
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, options.maxSources || 5);
}

async function searchRSSFeeds(searchQuery, feeds) {
    const results = [];
    const keywords = searchQuery.toLowerCase().split(/\s+OR\s+/);
    
    for (const [source, feedUrl] of Object.entries(feeds)) {
        try {
            const parser = new RSSParser();
            const feed = await parser.parseURL(feedUrl);
            
            feed.items.forEach(item => {
                // Calculate relevance score
                let score = 0;
                const titleLower = (item.title || '').toLowerCase();
                const contentLower = (item.contentSnippet || '').toLowerCase();
                
                keywords.forEach(keyword => {
                    if (titleLower.includes(keyword)) score += 10;
                    if (contentLower.includes(keyword)) score += 5;
                });
                
                if (score > 0) {
                    results.push({
                        title: item.title,
                        url: item.link,
                        source: source,
                        excerpt: item.contentSnippet?.substring(0, 200),
                        date: item.pubDate,
                        relevanceScore: score,
                        type: 'independent'
                    });
                }
            });
        } catch (err) {
            console.error(`RSS feed error for ${source}:`, err);
        }
    }
    
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
```

---

## 🚀 Deployment Steps

### Step 1: Update Backend Code

```bash
ssh user@185.193.126.13
cd /var/www/workforce-democracy/backend/

# Edit rss-service.js
nano rss-service.js
# Add RSS feed sources and better search logic

# Edit ai-service.js
nano ai-service.js
# Add keyword extraction function
```

### Step 2: Install RSS Parser

```bash
cd /var/www/workforce-democracy/backend/
npm install rss-parser
```

### Step 3: Restart Backend

```bash
pm2 delete backend
pm2 start server.js --name backend
pm2 save
```

### Step 4: Test

```bash
# Test with curl
curl -X POST http://185.193.126.13:3001/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What would be societal implications if the 19th amendment is repealed?"}' \
  | jq '.sources'

# Should now show:
# - Relevant articles about 19th amendment
# - Mix of Guardian, Breaking Points, ProPublica, etc.
# - NOT articles about Oasis or Thames Water!
```

---

## 📊 Expected Results After Fix

### Question: "19th amendment repealed implications"

**Before (Current - BAD):**
1. Guardian: "What would happen if politicians answered questions" ❌
2. Guardian: "Thames Water renationalisation" ❌
3. Guardian: "Oasis and British culture" ❌

**After (Fixed - GOOD):**
1. ProPublica: "Women's Voting Rights Under Threat" ✅
2. Guardian: "19th Amendment Anniversary Coverage" ✅
3. Breaking Points: "Constitutional Rights Discussion" ✅
4. NPR: "Women's Suffrage History" ✅
5. The Intercept: "Voting Rights Legislation" ✅

---

## 🎯 Summary

**Frontend:** ✅ Working perfectly (citations clickable, all sources accessible)

**Backend Issues:**
1. ❌ Guardian API search too broad - returns irrelevant results
2. ❌ Only using Guardian - need RSS from multiple sources

**Fixes Needed:**
1. Better keyword extraction from user questions
2. Add RSS parser for multiple news sources
3. Score results by relevance
4. Mix Guardian API + RSS feeds

**Next Steps:**
1. I can help you implement these backend changes
2. Or provide complete updated backend code
3. Test with relevant questions
4. Deploy and verify sources match questions

---

## 🤔 Do You Want Me To:

**Option A:** Create complete updated backend code files?
**Option B:** Guide you through editing the existing backend?
**Option C:** Focus on just improving Guardian API search first?

Let me know and I'll help you get relevant, diverse sources! 🚀
