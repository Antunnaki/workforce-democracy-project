#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT v37.8.3 - HEREDOC METHOD (Pattern-Independent)
# ═══════════════════════════════════════════════════════════════════════════════
# This version uses sed to find line numbers and direct replacement
# Works regardless of current formatting
# ═══════════════════════════════════════════════════════════════════════════════

cd /var/www/workforce-democracy/backend

# Backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp ai-service.js "ai-service.js.backup-$TIMESTAMP"
echo "✅ Backup created: ai-service.js.backup-$TIMESTAMP"

echo ""
echo "🔍 Finding needsCurrentInfo() function location..."

# Find the start line of the function
START_LINE=$(grep -n "function needsCurrentInfo" ai-service.js | cut -d: -f1)

if [ -z "$START_LINE" ]; then
    echo "❌ ERROR: needsCurrentInfo function not found!"
    exit 1
fi

echo "   Found at line: $START_LINE"

# Find the end of the function (next closing brace at same indentation level)
# We'll search for the return statement and the closing brace
END_LINE=$(awk -v start="$START_LINE" 'NR > start && /^}$/ {print NR; exit}' ai-service.js)

if [ -z "$END_LINE" ]; then
    echo "❌ ERROR: Could not find function end!"
    exit 1
fi

echo "   Function ends at line: $END_LINE"
echo ""

# Show what we're about to replace
echo "🔍 Current function (lines $START_LINE-$END_LINE):"
sed -n "${START_LINE},${END_LINE}p" ai-service.js
echo ""

# Create the new function
cat > /tmp/new-needsCurrentInfo.txt << 'EOF_FUNCTION'
function needsCurrentInfo(userMessage, llmResponse) {
    const messageLower = userMessage.toLowerCase();
    const responseLower = llmResponse.toLowerCase();
    
    // Enhanced temporal indicators - including time-of-day references
    const temporalWords = [
        '2024', '2025', 'current', 'recent', 'latest', 'now', 'today', 'this year',
        'tonight', 'this evening', 'this morning', 'this afternoon',
        'tomorrow', 'yesterday', 'this week', 'this month'
    ];
    const hasTemporalIndicator = temporalWords.some(word => 
        messageLower.includes(word) || responseLower.includes(word)
    );
    
    // LLM admits not knowing or mentions knowledge cutoff
    const admitsUnknown = responseLower.match(
        /don't have|not available|cannot find|no information|as of my knowledge cutoff|i don't know|unable to provide|training data|knowledge cutoff/
    );
    
    // Campaign finance queries (always need current data)
    const isCampaignFinance = messageLower.match(
        /donor|contribution|campaign finance|pac|funding|money|finance/
    );
    
    // Queries about specific current events - ENHANCED for local races + constitutional questions
    const isCurrentEvent = messageLower.match(
        /election|vote|voting|poll|ballot|bill|legislation|congress|senate|house|mayor|mayoral|city council|governor|race|primary|runoff|amendment|constitution|constitutional|repeal|repealed|supreme court|scotus|ruling|decision|right|rights/
    );
    
    // Local government queries (NYC, local races, etc.)
    const isLocalGov = messageLower.match(
        /nyc|new york city|manhattan|brooklyn|queens|bronx|staten island|local|city|municipal|borough/
    );
    
    // v37.8.3 FIX: Political figures and general political queries (Nov 9, 2025)
    // Trigger source search for politicians, political topics, and policy questions
    const isPoliticalQuery = messageLower.match(
        /bernie sanders|aoc|lindsey graham|biden|trump|pelosi|mcconnell|schumer|harris|senator|representative|congressman|congresswoman|politician|political|policy|welfare|healthcare|medicare|medicaid|social security|snap|food stamps|climate|environment|labor|union|workers|immigration|border|tax|taxes|wealthy|rich|corporation|corporate|war|military|foreign policy|middle east|ukraine|israel|palestine|china|russia/
    );
    
    return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPoliticalQuery;
}
EOF_FUNCTION

# Replace the function using sed
sed -i "${START_LINE},${END_LINE}d" ai-service.js
sed -i "$((START_LINE-1))r /tmp/new-needsCurrentInfo.txt" ai-service.js

echo "✅ Function replaced"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo "✅ Checking for isPoliticalQuery pattern:"
if grep -q "const isPoliticalQuery = messageLower.match" ai-service.js; then
    echo "   ✅ isPoliticalQuery pattern found"
    grep "bernie sanders" ai-service.js | head -1
else
    echo "   ❌ isPoliticalQuery NOT FOUND"
    exit 1
fi

echo ""
echo "✅ Checking return statement:"
if grep -q "isPoliticalQuery;" ai-service.js; then
    echo "   ✅ Return statement includes isPoliticalQuery"
    grep "return.*isPoliticalQuery" ai-service.js
else
    echo "   ❌ Return statement MISSING isPoliticalQuery"
    exit 1
fi

echo ""
echo "✅ Syntax check:"
node -c ai-service.js && echo "   ✅ No syntax errors" || { echo "   ❌ SYNTAX ERROR"; exit 1; }

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔄 NUCLEAR PM2 RESTART (clears Node.js module cache)"
echo "═══════════════════════════════════════════════════════════════════════════════"

pm2 stop backend
pm2 flush
pm2 delete backend
pkill -9 node
sleep 2

cd /var/www/workforce-democracy/backend
pm2 start server.js --name backend
pm2 save
sleep 3

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT v37.8.3 COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 What changed:"
echo "   ✅ Added isPoliticalQuery pattern to needsCurrentInfo()"
echo "   ✅ Now matches: bernie sanders, aoc, biden, trump, policy keywords, etc."
echo "   ✅ Triggers RSS source search for political queries"
echo ""
echo "🧪 Test queries in chat interface:"
echo "   • 'can you tell me about bernie sanders?'"
echo "   • 'what is lindsey graham's voting record?'"
echo "   • 'climate policy news'"
echo "   • 'healthcare reform latest'"
echo ""
echo "📊 Monitor logs:"
echo "   pm2 logs backend --lines 50 | grep -A5 'bernie'"
echo ""
echo "Expected to see:"
echo "   🌍 Using global RSS/API sources"
echo "   📡 Fetching RSS: Democracy Now"
echo "   📡 Fetching RSS: The Intercept"
echo "   ✅ Global news: Found 10-20 sources"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
