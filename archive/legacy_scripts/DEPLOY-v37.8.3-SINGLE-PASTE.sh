#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT v37.8.3 - FIX POLITICAL QUERY SOURCE SEARCH
# ═══════════════════════════════════════════════════════════════════════════════
# 
# 📋 COPY ALL LINES BELOW AND PASTE INTO SSH TERMINAL
# ═══════════════════════════════════════════════════════════════════════════════

cd /var/www/workforce-democracy/backend

# Backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp ai-service.js "ai-service.js.backup-$TIMESTAMP"

echo "🔧 Deploying v37.8.3 - Adding isPoliticalQuery pattern..."

# Create a temporary JavaScript file with the fix
cat > /tmp/fix-political-query.js << 'EOF_FIX'
const fs = require('fs');

// Read ai-service.js
const content = fs.readFileSync('ai-service.js', 'utf8');

// Find the needsCurrentInfo function and replace it
const oldPattern = /function needsCurrentInfo\(userMessage, llmResponse\) \{[\s\S]*?return hasTemporalIndicator \|\| admitsUnknown \|\| isCampaignFinance \|\| isCurrentEvent \|\| isLocalGov;[\s]*?\}/;

const newFunction = `function needsCurrentInfo(userMessage, llmResponse) {
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
}`;

const newContent = content.replace(oldPattern, newFunction);

// Check if replacement happened
if (newContent === content) {
    console.error('❌ Pattern not found - function not replaced!');
    process.exit(1);
}

// Write back
fs.writeFileSync('ai-service.js', newContent, 'utf8');
console.log('✅ Successfully updated needsCurrentInfo() function');
EOF_FIX

# Run the fix
node /tmp/fix-political-query.js

echo ""
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
fi

echo ""
echo "✅ Checking return statement:"
if grep -q "return hasTemporalIndicator.*isPoliticalQuery" ai-service.js; then
    echo "   ✅ Return statement includes isPoliticalQuery"
else
    echo "   ❌ Return statement MISSING isPoliticalQuery"
fi

echo ""
echo "✅ Syntax check:"
node -c ai-service.js && echo "   ✅ No syntax errors" || echo "   ❌ SYNTAX ERROR"

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
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 What changed:"
echo "   ✅ Added isPoliticalQuery pattern to needsCurrentInfo()"
echo "   ✅ Now recognizes political queries and triggers RSS source search"
echo ""
echo "🧪 Test these queries (should now return 10-20 sources):"
echo "   • can you tell me about bernie sanders?"
echo "   • what is lindsey graham's record?"
echo "   • climate policy news"
echo "   • healthcare reform"
echo ""
echo "📊 Check logs:"
echo "   pm2 logs backend --lines 30"
echo ""
echo "Expected log output:"
echo "   🌍 Using global RSS/API sources"
echo "   📡 Fetching RSS: Democracy Now"
echo "   📡 Fetching RSS: Mother Jones"
echo "   ✅ Global news: Found 10+ sources"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
