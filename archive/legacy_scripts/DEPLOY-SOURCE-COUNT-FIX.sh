#!/bin/bash
# Progressive Policy Assistant - Source Count Fix
# Deployment: Nov 8, 2025
# Issue: Only getting 4-5 sources instead of 10-15
# Solution: Fix iteration loop, increase thresholds, diversify queries

cat > /tmp/fix-source-count.py << 'PYTHON_SCRIPT_EOF'
#!/usr/bin/env python3
import re
import sys

def fix_ai_service(content):
    """Fix source count issues in ai-service.js"""
    
    # Change 1: Add SOURCE_THRESHOLD constant
    # Find the first function definition and add constant before it
    threshold_constant = '''
// v37.8.0: Source threshold for iterative search
const SOURCE_THRESHOLD = 12;
const MAX_SEARCH_ITERATIONS = 4;

'''
    
    # Add threshold constant before analyzeSourceGaps function
    content = re.sub(
        r'(function analyzeSourceGaps)',
        threshold_constant + r'\1',
        content,
        count=1
    )
    
    # Change 2: Update analyzeSourceGaps thresholds from 5 to 12
    content = re.sub(
        r'if \(sources\.length < 5\)',
        'if (sources.length < SOURCE_THRESHOLD)',
        content
    )
    
    # Change 3: Update threshold from 3 to 12
    content = re.sub(
        r'if \(hasMusicArticle \|\| sources\.length < 3\)',
        'if (hasMusicArticle || sources.length < SOURCE_THRESHOLD)',
        content
    )
    
    # Change 4: Replace single follow-up with iteration loop
    old_loop = r'''        // PHASE 1\.25: Iterative search - analyze gaps and search again
        console\.log\('🔍 Analyzing source gaps\.\.\.'\);
        const gaps = analyzeSourceGaps\(sources, query\);
        
        if \(gaps\.needsMoreData && gaps\.followUpQueries\.length > 0\) \{
            console\.log\(`  📊 Found \$\{gaps\.followUpQueries\.length\} follow-up queries`\);
            
            const followUpSources = \[\];
            for \(const followUpQuery of gaps\.followUpQueries\) \{
                console\.log\(`  🔎 Follow-up: "\$\{followUpQuery\}"`\);
                try \{
                    const additional = await searchAdditionalSources\(followUpQuery, ''\);
                    followUpSources\.push\(\.\.\.additional\);
                \} catch \(error\) \{
                    console\.error\(`  ⚠️ Follow-up search failed: \$\{error\.message\}`\);
                \}
            \}
            
            // Remove duplicates and merge
            const existingUrls = new Set\(sources\.map\(s => s\.url\)\);
            const newSources = followUpSources\.filter\(s => !existingUrls\.has\(s\.url\)\);
            sources\.push\(\.\.\.newSources\);
            console\.log\(`  📚 Total sources after iterative search: \$\{sources\.length\}`\);
        \} else \{
            console\.log\('  ✅ Sufficient sources found, no follow-up needed'\);
        \}'''
    
    new_loop = '''        // PHASE 1.25: Iterative search - analyze gaps and search until threshold met
        console.log('🔍 Starting iterative source search...');
        let iteration = 0;
        
        while (sources.length < SOURCE_THRESHOLD && iteration < MAX_SEARCH_ITERATIONS) {
            iteration++;
            console.log(`  🔄 Iteration ${iteration}: Have ${sources.length}/${SOURCE_THRESHOLD} sources`);
            
            const gaps = analyzeSourceGaps(sources, query);
            
            if (!gaps.needsMoreData || gaps.followUpQueries.length === 0) {
                console.log(`  ⏹️  No more follow-ups available (iteration ${iteration})`);
                break;
            }
            
            console.log(`  📊 Generated ${gaps.followUpQueries.length} follow-up queries`);
            
            const followUpSources = [];
            for (const followUpQuery of gaps.followUpQueries) {
                console.log(`  🔎 Follow-up: "${followUpQuery}"`);
                try {
                    const additional = await searchAdditionalSources(followUpQuery, '');
                    followUpSources.push(...additional);
                } catch (error) {
                    console.error(`  ⚠️ Follow-up search failed: ${error.message}`);
                }
            }
            
            // Remove duplicates and merge
            const existingUrls = new Set(sources.map(s => s.url));
            const newSources = followUpSources.filter(s => !existingUrls.has(s.url));
            
            if (newSources.length === 0) {
                console.log(`  ⏹️  No new unique sources found, stopping iteration`);
                break;
            }
            
            sources.push(...newSources);
            console.log(`  📚 Total sources after iteration ${iteration}: ${sources.length}`);
        }
        
        console.log(`  ✅ Iterative search complete: ${sources.length} total sources (${iteration} iterations)`);'''
    
    content = re.sub(old_loop, new_loop, content, flags=re.DOTALL)
    
    # Change 5: Add more diverse follow-up queries for SNAP
    old_snap = r'''    // Detect SNAP queries
    if \(queryLower\.match\(/snap\|food stamp\|welfare\|benefit/i\)\) \{
        if \(sources\.length < 5\) \{
            followUpQueries\.push\('SNAP benefits dollar amount changes 2024 2025'\);
            followUpQueries\.push\('food stamp cuts impact low income families statistics'\);
            followUpQueries\.push\('SNAP benefits Supreme Court ruling details'\);
        \}
    \}'''
    
    new_snap = '''    // Detect SNAP queries
    if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            const year = new Date().getFullYear();
            followUpQueries.push(`SNAP benefits cuts ${year} statistics data`);
            followUpQueries.push('food stamp program economic impact families');
            followUpQueries.push('SNAP policy changes congressional legislation vote');
            followUpQueries.push('food assistance funding cuts analysis');
            followUpQueries.push('supplemental nutrition program impact research');
            followUpQueries.push('SNAP benefits low income households data');
        }
    }'''
    
    content = re.sub(old_snap, new_snap, content)
    
    # Change 6: Update policy queries threshold and diversity
    old_policy = r'''    // Detect policy queries
    if \(queryLower\.match\(/policy\|healthcare\|medicare\|medicaid\|social security/i\)\) \{
        if \(sources\.length < 5\) \{
            followUpQueries\.push\(originalQuery \+ ' policy analysis'\);
            followUpQueries\.push\(originalQuery \+ ' economic impact'\);
        \}
    \}'''
    
    new_policy = '''    // Detect policy queries
    if (queryLower.match(/policy|healthcare|medicare|medicaid|social security/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            const year = new Date().getFullYear();
            followUpQueries.push(`${originalQuery} policy analysis ${year}`);
            followUpQueries.push(`${originalQuery} economic impact data`);
            followUpQueries.push(`${originalQuery} legislation changes recent`);
            followUpQueries.push(`${originalQuery} statistics research study`);
        }
    }'''
    
    content = re.sub(old_policy, new_policy, content)
    
    return content

# Read the file
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Apply fixes
content = fix_ai_service(content)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Fixed ai-service.js:")
print("  - Added SOURCE_THRESHOLD = 12 constant")
print("  - Updated gap analysis thresholds (5 → 12)")
print("  - Replaced single follow-up with iteration loop")
print("  - Added more diverse follow-up queries")
print("  - Max iterations: 4")

PYTHON_SCRIPT_EOF

# Make script executable
chmod +x /tmp/fix-source-count.py

# Run the fix
echo "🔧 Applying source count fixes to ai-service.js..."
python3 /tmp/fix-source-count.py

# Nuclear PM2 restart to clear module cache
echo "🔄 Performing nuclear PM2 restart..."
pm2 stop backend
pm2 flush
pm2 delete backend
pkill -9 node

# Wait a moment
sleep 2

# Restart backend
cd /var/www/workforce-democracy/backend
pm2 start server.js --name backend

# Check status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🧪 Test with:"
echo "   Ask: 'What are Republicans proposing for SNAP benefits?'"
echo "   Expected: 10-15 sources with specific data"
echo ""
echo "📋 Watch logs:"
echo "   pm2 logs backend --lines 50"
echo ""
echo "✨ Look for:"
echo "   🔄 Iteration 1: Have X/12 sources"
echo "   🔄 Iteration 2: Have X/12 sources"
echo "   ✅ Iterative search complete: 12+ total sources"
