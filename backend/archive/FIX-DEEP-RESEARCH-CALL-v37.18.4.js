/**
 * DEEP RESEARCH FIX - v37.18.4
 * =============================
 * CRITICAL FIX: searchRepresentativeVotingRecord must call searchCongressGovBills
 * 
 * ISSUE: Deep Research completes but returns 0 sources because searchCongressGovBills
 * is never actually invoked.
 * 
 * SOLUTION: Ensure searchRepresentativeVotingRecord properly calls searchCongressGovBills
 * and returns Congress.gov bills in the sources array.
 */

const fs = require('fs');
const path = require('path');

async function fixDeepResearchCall() {
    const filePath = '/var/www/workforce-democracy/version-b/backend/deep-research.js';
    
    console.log('🔧 DEEP RESEARCH CALL FIX - v37.18.4');
    console.log('=====================================\n');
    
    // 1. Backup the file
    const backupPath = filePath.replace('.js', `-BACKUP-before-call-fix-${Date.now()}.js`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backed up to: ${backupPath}\n`);
    
    // 2. Read current content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 3. Check if searchCongressGovBills is defined
    if (!content.includes('async function searchCongressGovBills')) {
        console.log('❌ ERROR: searchCongressGovBills function not found in deep-research.js');
        console.log('   This function is required for Deep Research to work.\n');
        return false;
    }
    
    // 4. Find searchRepresentativeVotingRecord function
    const funcStartRegex = /async function searchRepresentativeVotingRecord\s*\([^)]*\)\s*\{/;
    const funcStartMatch = content.match(funcStartRegex);
    
    if (!funcStartMatch) {
        console.log('❌ ERROR: searchRepresentativeVotingRecord function not found');
        return false;
    }
    
    console.log('✅ Found searchRepresentativeVotingRecord function\n');
    
    // 5. Check if it's calling searchCongressGovBills
    const funcStart = content.indexOf(funcStartMatch[0]);
    const funcEnd = findFunctionEnd(content, funcStart);
    const functionBody = content.substring(funcStart, funcEnd);
    
    if (functionBody.includes('searchCongressGovBills(')) {
        console.log('✅ searchRepresentativeVotingRecord IS calling searchCongressGovBills');
        console.log('   The issue might be elsewhere.\n');
        
        // Check if results are being pushed to sources
        if (functionBody.includes('congressBills') && functionBody.includes('sources.push')) {
            console.log('✅ Congress bills ARE being pushed to sources array\n');
            console.log('🔍 The Deep Research integration looks correct.');
            console.log('   Issue might be in:');
            console.log('   - Congress.gov API credentials');
            console.log('   - Network connectivity');
            console.log('   - API rate limiting\n');
        } else {
            console.log('⚠️  Congress bills found but NOT being added to sources!');
            console.log('   This is likely the bug.\n');
        }
    } else {
        console.log('❌ CRITICAL: searchCongressGovBills is NOT being called!');
        console.log('   This is the bug preventing Deep Research from working.\n');
        
        // Apply the fix
        console.log('🔧 Applying fix...\n');
        
        // Find where to insert the call (after extracting representative name)
        const insertPattern = /const\s+representativeName\s*=\s*context\.representative[^;]*;/;
        const insertMatch = functionBody.match(insertPattern);
        
        if (insertMatch) {
            const insertPoint = functionBody.indexOf(insertMatch[0]) + insertMatch[0].length;
            
            const congressCallCode = `
    
    // ========================================
    // DEEP RESEARCH: Search Congress.gov API
    // ========================================
    console.log(\`[Deep Research] Searching Congress.gov for \${representativeName}...\`);
    
    try {
        const congressBills = await searchCongressGovBills(query, representativeName);
        console.log(\`[Deep Research] Found \${congressBills.length} Congress.gov bills\`);
        
        // Add Congress.gov bills to sources
        congressBills.forEach(bill => sources.push(bill));
        
    } catch (error) {
        console.error('[Deep Research] Congress.gov search error:', error.message);
    }
    `;
            
            const updatedFunctionBody = functionBody.slice(0, insertPoint) + congressCallCode + functionBody.slice(insertPoint);
            content = content.substring(0, funcStart) + updatedFunctionBody + content.substring(funcEnd);
            
            // Write fixed content
            fs.writeFileSync(filePath, content);
            console.log('✅ FIX APPLIED: Added searchCongressGovBills call\n');
            return true;
        } else {
            console.log('❌ Could not find safe insertion point in function');
            return false;
        }
    }
    
    return true;
}

// Helper function to find the end of a function
function findFunctionEnd(content, startIndex) {
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIndex; i < content.length; i++) {
        const char = content[i];
        const prevChar = i > 0 ? content[i-1] : '';
        
        // Handle strings
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
            if (inString && char === stringChar) {
                inString = false;
            } else if (!inString) {
                inString = true;
                stringChar = char;
            }
        }
        
        if (!inString) {
            if (char === '{') depth++;
            if (char === '}') depth--;
            
            if (depth === 0 && i > startIndex) {
                return i + 1;
            }
        }
    }
    
    return content.length;
}

// Run the fix
fixDeepResearchCall()
    .then(success => {
        if (success) {
            console.log('🎉 Fix complete! Now run:');
            console.log('   cd /var/www/workforce-democracy/version-b/backend');
            console.log('   sudo systemctl restart workforce-backend-b.service');
            console.log('   ');
            console.log('   Then test with:');
            console.log('   curl -X POST "http://localhost:3002/api/civic/llm-chat/submit" \\');
            console.log('     -H "Content-Type: application/json" \\');
            console.log('     -d \'{"message": "How has Chuck Schumer voted on healthcare?", "context": {"page": "civic-platform"}}\'');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('💥 Error:', err);
        process.exit(1);
    });
