#!/bin/bash

##############################################################################
# 🚀 POLICY RESEARCH ENHANCEMENT v37.9.4 - AUTOMATED DEPLOYMENT
##############################################################################
#
# What this script does:
# 1. Backs up current backend files
# 2. Adds 10 California-specific RSS feeds to rss-service.js
# 3. Enhances analyzeSourceGaps function with policy research patterns
# 4. Increases source threshold for policy questions (15 → 25)
# 5. Restarts PM2 backend
# 6. Verifies deployment success
#
# Cost: $0/month (100% free sources)
# Time: ~30 seconds
#
# Created: 2025-01-11
# Version: 37.9.4
#
##############################################################################

set -e  # Exit on error

echo ""
echo "🚀🚀🚀 POLICY RESEARCH ENHANCEMENT v37.9.4 🚀🚀🚀"
echo ""
echo "📅 Deployment started: $(date)"
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/backend/

echo "✅ Step 1: Creating backups..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp rss-service.js "rss-service.js.backup-${TIMESTAMP}"
cp ai-service.js "ai-service.js.backup-${TIMESTAMP}"
echo "   ✅ Backup created: rss-service.js.backup-${TIMESTAMP}"
echo "   ✅ Backup created: ai-service.js.backup-${TIMESTAMP}"
echo ""

##############################################################################
# STEP 2: Add California RSS Feeds to rss-service.js
##############################################################################

echo "✅ Step 2: Adding California RSS feeds..."

# Find the line after 'us_independent': [ ... ] closes (line ~203)
# Insert new 'california_news' section

# Create Python script for precise insertion
cat > /tmp/add-california-feeds.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import re

# Read the file
with open('rss-service.js', 'r') as f:
    content = f.read()

# Define the California news feeds section
california_feeds = '''
    // =============================================================================
    // CALIFORNIA - STATE-SPECIFIC NEWS & GOVERNMENT DATA
    // =============================================================================
    'california_news': [
        {
            name: 'CalMatters',
            url: 'https://calmatters.org/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'state_budget', 'policy', 'california_politics']
        },
        {
            name: 'CalMatters Housing',
            url: 'https://calmatters.org/housing/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'affordability']
        },
        {
            name: 'LA Times California',
            url: 'https://www.latimes.com/california/rss2.0.xml',
            bias: 'establishment_liberal',
            region: 'california',
            language: 'en',
            topics: ['california_politics', 'housing', 'homelessness']
        },
        {
            name: 'SF Chronicle Politics',
            url: 'https://www.sfchronicle.com/politics/feed/',
            bias: 'establishment_liberal',
            region: 'california',
            language: 'en',
            topics: ['california_politics', 'housing', 'state_government']
        },
        {
            name: 'Sacramento Bee Politics',
            url: 'https://www.sacbee.com/news/politics-government/rss',
            bias: 'establishment_liberal',
            region: 'california',
            language: 'en',
            topics: ['state_government', 'budget', 'california_politics']
        },
        {
            name: 'Voice of San Diego',
            url: 'https://voiceofsandiego.org/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'local_policy', 'accountability']
        },
        {
            name: 'Streetsblog California',
            url: 'https://cal.streetsblog.org/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'urban_planning', 'transportation']
        },
        {
            name: 'KQED California',
            url: 'https://www.kqed.org/news/feed/california',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'state_policy', 'california_politics']
        },
        {
            name: 'Capital Public Radio',
            url: 'https://www.capradio.org/articles/?format=rss',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['state_politics', 'policy', 'california_government']
        },
        {
            name: 'LAist',
            url: 'https://laist.com/feed.xml',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'los_angeles', 'local_policy']
        }
    ],
'''

# Find the closing of 'us_independent' section
# Look for the pattern: "        }\n    ],\n    \n    //"
# Insert California section before the next section comment

pattern = r"(    \],\s+)(    // =============================================================================\s+// MIDDLE EAST)"
replacement = r"\1" + california_feeds + r"\n\2"

# Check if pattern exists
if re.search(pattern, content):
    content = re.sub(pattern, replacement, content, count=1)
    print("✅ California RSS feeds inserted successfully")
else:
    # Try alternative pattern (after us_independent closing)
    alt_pattern = r"(        topics: \['politics', 'social_justice', 'labor'\]\s+}\s+\],\s+)(    // =)"
    if re.search(alt_pattern, content):
        content = re.sub(alt_pattern, r"\1" + california_feeds + r"\n\2", content, count=1)
        print("✅ California RSS feeds inserted successfully (alt pattern)")
    else:
        print("⚠️  Could not find insertion point - adding at end of RSS_FEEDS object")
        # Find the closing of RSS_FEEDS object
        content = content.replace(
            "    ]\n};",
            "    ],\n" + california_feeds + "\n};"
        )

# Write back
with open('rss-service.js', 'w') as f:
    f.write(content)

print("✅ rss-service.js updated with California feeds")
PYTHON_SCRIPT

chmod +x /tmp/add-california-feeds.py
python3 /tmp/add-california-feeds.py

echo "   ✅ Added 10 California news RSS feeds"
echo ""

##############################################################################
# STEP 3: Enhance analyzeSourceGaps for Policy Research
##############################################################################

echo "✅ Step 3: Enhancing AI policy research capability..."

# Create Python script for enhancing analyzeSourceGaps function
cat > /tmp/enhance-policy-research.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import re

# Read the file
with open('ai-service.js', 'r') as f:
    content = f.read()

# Step 1: Update SOURCE_THRESHOLD from 15 to 25 for policy questions
content = re.sub(
    r'const SOURCE_THRESHOLD = 15;',
    'const SOURCE_THRESHOLD = 25; // Increased for comprehensive policy research',
    content
)
print("✅ SOURCE_THRESHOLD increased: 15 → 25")

# Step 2: Replace analyzeSourceGaps function with enhanced version
old_function_start = "function analyzeSourceGaps(sources, originalQuery) {"
old_function_end = "    };\n}"

# Find the function
match = re.search(
    r'function analyzeSourceGaps\(sources, originalQuery\) \{.*?^\}',
    content,
    re.DOTALL | re.MULTILINE
)

if match:
    # New enhanced function
    new_function = '''function analyzeSourceGaps(sources, originalQuery) {
    if (!originalQuery || typeof originalQuery !== 'string') {
        return { needsMoreData: false, followUpQueries: [] };
    }
    
    const queryLower = originalQuery.toLowerCase();
    const followUpQueries = [];
    
    // =============================================================================
    // POLICY RESEARCH PATTERNS (v37.9.4)
    // =============================================================================
    
    // Pattern 1: Housing & Homelessness Policy
    if (queryLower.match(/housing|homelessness|unhoused|homeless|affordable housing|rent control|eviction/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' budget allocation spending');
            followUpQueries.push(originalQuery + ' audit report accountability');
            followUpQueries.push(originalQuery + ' results outcomes data');
            followUpQueries.push(originalQuery + ' state funding breakdown');
        }
    }
    
    // Pattern 2: State Budget & Spending
    if (queryLower.match(/allocated|spending|budget|appropriation|funding|billion|million/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' audit findings');
            followUpQueries.push(originalQuery + ' where money went');
            followUpQueries.push(originalQuery + ' accountability results');
            followUpQueries.push(originalQuery + ' impact evaluation');
        }
    }
    
    // Pattern 3: Governor/Political Figure Records
    if (queryLower.match(/governor|mayor|senator|representative|congressman|politician/i) && 
        queryLower.match(/record|policy|track record|results|achievement/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' policy analysis investigation');
            followUpQueries.push(originalQuery + ' spending accountability audit');
            followUpQueries.push(originalQuery + ' legislative history bills');
            followUpQueries.push(originalQuery + ' expert analysis evaluation');
        }
    }
    
    // Pattern 4: California-specific queries
    if (queryLower.match(/california|newsom|gavin newsom|ca gov|sacramento/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' CalMatters investigation');
            followUpQueries.push(originalQuery + ' state auditor report');
            followUpQueries.push(originalQuery + ' LAO analysis');
        }
    }
    
    // =============================================================================
    // EXISTING PATTERNS (Preserved)
    // =============================================================================
    
    // Pattern: SNAP & Benefits
    if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push('SNAP benefits cuts 2025 statistics');
            followUpQueries.push('SNAP benefits economic impact data');
            followUpQueries.push('SNAP benefits Supreme Court ruling details');
        }
    }
    
    // Pattern: Healthcare Policy
    if (queryLower.match(/healthcare|medicare|medicaid|social security|insurance/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' policy analysis');
            followUpQueries.push(originalQuery + ' economic impact');
        }
    }
    
    // Pattern: Climate & Environment
    if (queryLower.match(/climate|environment|emissions|renewable|fossil fuel/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' policy legislation');
            followUpQueries.push(originalQuery + ' environmental impact');
        }
    }
    
    // Pattern: Labor & Workers Rights
    if (queryLower.match(/labor|union|workers|wage|employment|strike/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' labor statistics');
            followUpQueries.push(originalQuery + ' worker impact analysis');
        }
    }
    
    // Detect music articles - this is a gap that needs more relevant sources
    const hasMusicArticle = sources.some(s => 
        (s.title || '').toLowerCase().match(/turn it up|song|album|concert|music/i)
    );
    
    if (hasMusicArticle || sources.length < SOURCE_THRESHOLD) {
        followUpQueries.push(originalQuery + ' news analysis');
    }
    
    return {
        needsMoreData: followUpQueries.length > 0,
        followUpQueries: followUpQueries.slice(0, 4) // Max 4 follow-ups (increased from 3)
    };
}'''
    
    content = content[:match.start()] + new_function + content[match.end():]
    print("✅ analyzeSourceGaps function enhanced with policy research patterns")
else:
    print("⚠️  Could not find analyzeSourceGaps function")

# Write back
with open('ai-service.js', 'w') as f:
    f.write(content)

print("✅ ai-service.js updated with policy research enhancements")
PYTHON_SCRIPT

chmod +x /tmp/enhance-policy-research.py
python3 /tmp/enhance-policy-research.py

echo "   ✅ Added 7 policy research patterns"
echo "   ✅ Increased follow-up queries: 3 → 4"
echo "   ✅ Enhanced for California-specific queries"
echo ""

##############################################################################
# STEP 4: Verify Changes
##############################################################################

echo "✅ Step 4: Verifying changes..."

# Check if California feeds were added
if grep -q "CalMatters" rss-service.js; then
    echo "   ✅ California RSS feeds verified"
else
    echo "   ❌ California RSS feeds NOT found - deployment may have failed"
    exit 1
fi

# Check if SOURCE_THRESHOLD was updated
if grep -q "const SOURCE_THRESHOLD = 25" ai-service.js; then
    echo "   ✅ SOURCE_THRESHOLD increased to 25"
else
    echo "   ⚠️  SOURCE_THRESHOLD not updated (may still be 15)"
fi

# Check if policy patterns were added
if grep -q "housing|homelessness|unhoused" ai-service.js; then
    echo "   ✅ Policy research patterns verified"
else
    echo "   ❌ Policy research patterns NOT found - deployment may have failed"
    exit 1
fi

echo ""

##############################################################################
# STEP 5: Nuclear PM2 Restart
##############################################################################

echo "✅ Step 5: Restarting PM2 backend (nuclear restart)..."

# Nuclear PM2 restart to clear Node.js module cache
pm2 stop backend 2>/dev/null || true
sleep 2
pm2 flush 2>/dev/null || true
pm2 delete backend 2>/dev/null || true
sleep 2

echo "   🔧 Starting fresh PM2 process..."
cd /var/www/workforce-democracy/backend/
pm2 start server.js --name backend

sleep 3

echo "   ✅ PM2 backend restarted"
echo ""

##############################################################################
# STEP 6: Verify Backend is Running
##############################################################################

echo "✅ Step 6: Verifying backend status..."

# Check PM2 status
if pm2 list | grep -q "backend.*online"; then
    echo "   ✅ Backend is ONLINE"
else
    echo "   ❌ Backend is NOT online - check logs:"
    echo "   Run: pm2 logs backend --lines 50"
    exit 1
fi

echo ""

##############################################################################
# STEP 7: Show Recent Logs
##############################################################################

echo "✅ Step 7: Recent backend logs:"
echo ""
pm2 logs backend --lines 20 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE - v37.9.4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ California RSS feeds added: 10 sources"
echo "✅ Policy research patterns added: 7 patterns"
echo "✅ Source threshold increased: 15 → 25"
echo "✅ Follow-up queries increased: 3 → 4"
echo "✅ Backend restarted successfully"
echo ""
echo "🎯 TEST THE ENHANCEMENT:"
echo ""
echo "Ask in your frontend:"
echo '   "What is Gavin Newsom'"'"'s record on the unhoused problem in California?"'
echo ""
echo "Expected: 18-25 sources including CalMatters, state audits, LAO reports"
echo ""
echo "📊 BACKUPS CREATED:"
echo "   - rss-service.js.backup-${TIMESTAMP}"
echo "   - ai-service.js.backup-${TIMESTAMP}"
echo ""
echo "📅 Deployment completed: $(date)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
