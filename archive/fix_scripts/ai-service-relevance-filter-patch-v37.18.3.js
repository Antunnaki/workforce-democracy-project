/**
 * SMART RELEVANCE FILTER ENHANCEMENT - v37.18.3
 * 
 * This patch enhances the relevance scoring in ai-service.js to:
 * 1. Recognize Congress.gov bills as high-priority sources
 * 2. Give bonus scores to government sources (.gov domains)
 * 3. Reduce minimum score threshold for primary sources
 * 4. Improve scoring for sources with limited metadata
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Find the scoreSource() or calculateRelevance() function in ai-service.js
 * 2. Replace the existing function with this enhanced version
 * 3. Update the SOURCE_THRESHOLD from 30 to 20 for primary sources
 */

/**
 * Enhanced Source Scoring Function
 * v37.18.3: Smart recognition of government and primary sources
 * 
 * @param {object} source - Source object with title, url, description, content, metadata
 * @param {string} query - User's search query
 * @returns {number} Relevance score (0-100+)
 */
function scoreSourceEnhanced(source, query) {
    let score = 0;
    
    // Extract query keywords
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
    
    // ======================
    // 1. GOVERNMENT SOURCE BONUS (NEW in v37.18.3)
    // ======================
    const isGovSource = source.url && (
        source.url.includes('congress.gov') ||
        source.url.includes('.gov') ||
        source.url.includes('senate.gov') ||
        source.url.includes('house.gov')
    );
    
    if (isGovSource) {
        score += 50; // Major bonus for government sources
        console.log(`   🏛️  [Scoring] Government source bonus: +50`);
    }
    
    // ======================
    // 2. PRIMARY SOURCE BONUS (NEW in v37.18.3)
    // ======================
    if (source.metadata?.isPrimarySource || source.metadata?.isGovernmentSource) {
        score += 30;
        console.log(`   📜 [Scoring] Primary source bonus: +30`);
    }
    
    // ======================
    // 3. CONGRESS.GOV BILL BONUS (NEW in v37.18.3)
    // ======================
    if (source.type === 'congress_bill' || source.metadata?.billNumber) {
        score += 40; // Bills are highly relevant for representative queries
        console.log(`   📋 [Scoring] Congress.gov bill bonus: +40`);
    }
    
    // ======================
    // 4. TITLE MATCHING
    // ======================
    if (source.title) {
        const titleLower = source.title.toLowerCase();
        let titleMatches = 0;
        for (const word of queryWords) {
            if (titleLower.includes(word)) {
                titleMatches++;
                score += 10;
            }
        }
        if (titleMatches > 0) {
            console.log(`   📰 [Scoring] Title matches (${titleMatches}): +${titleMatches * 10}`);
        }
    }
    
    // ======================
    // 5. DESCRIPTION MATCHING
    // ======================
    if (source.description) {
        const descLower = source.description.toLowerCase();
        let descMatches = 0;
        for (const word of queryWords) {
            if (descLower.includes(word)) {
                descMatches++;
                score += 5;
            }
        }
        if (descMatches > 0) {
            console.log(`   📝 [Scoring] Description matches (${descMatches}): +${descMatches * 5}`);
        }
    }
    
    // ======================
    // 6. CONTENT MATCHING (if available)
    // ======================
    if (source.content) {
        const contentLower = source.content.toLowerCase();
        let contentMatches = 0;
        for (const word of queryWords) {
            if (contentLower.includes(word)) {
                contentMatches++;
                score += 3;
            }
        }
        if (contentMatches > 0) {
            console.log(`   📄 [Scoring] Content matches (${contentMatches}): +${contentMatches * 3}`);
        }
    }
    
    // ======================
    // 7. TRUSTED SOURCE BONUS (existing logic)
    // ======================
    const trustedSources = ['ProPublica', 'OpenSecrets', 'Congress.gov', 'Senate.gov', 'House.gov'];
    if (source.source && trustedSources.includes(source.source)) {
        score += 20;
        console.log(`   ✅ [Scoring] Trusted source bonus: +20`);
    }
    
    console.log(`   🎯 [Scoring] Final score for "${source.title?.substring(0, 50)}...": ${score}`);
    return score;
}

/**
 * Enhanced Source Filtering Logic
 * v37.18.3: Dynamic threshold based on source type
 * 
 * Replace the existing threshold check with this logic:
 */
function filterSourcesByRelevanceEnhanced(sources, query) {
    const scoredSources = sources.map(source => ({
        ...source,
        relevanceScore: scoreSourceEnhanced(source, query)
    }));
    
    // SMART THRESHOLD (NEW in v37.18.3)
    // - Government sources: minimum score 20
    // - Other sources: minimum score 30
    const filtered = scoredSources.filter(source => {
        const isGovSource = source.metadata?.isGovernmentSource || 
                           source.type === 'congress_bill' ||
                           source.url?.includes('.gov');
        
        const threshold = isGovSource ? 20 : 30;
        const passes = source.relevanceScore >= threshold;
        
        if (!passes) {
            console.log(`   ❌ [Filter] Removed: "${source.title?.substring(0, 40)}..." (score: ${source.relevanceScore}, threshold: ${threshold})`);
        } else {
            console.log(`   ✅ [Filter] Kept: "${source.title?.substring(0, 40)}..." (score: ${source.relevanceScore})`);
        }
        
        return passes;
    });
    
    console.log(`📊 [Filter] Kept ${filtered.length}/${sources.length} sources`);
    return filtered;
}

/**
 * DEPLOYMENT SCRIPT FOR VPS
 * 
 * To apply this patch to ai-service.js:
 * 
 * 1. SSH to VPS: ssh root@185.193.126.13
 * 
 * 2. Backup ai-service.js:
 *    cp /var/www/workforce-democracy/version-b/backend/ai-service.js \
 *       /var/www/workforce-democracy/version-b/backend/ai-service-BACKUP-before-filter-patch-$(date +%Y%m%d-%H%M%S).js
 * 
 * 3. Find the scoring function:
 *    grep -n "function scoreSource\|function calculateRelevance" /var/www/workforce-democracy/version-b/backend/ai-service.js
 * 
 * 4. Manually replace the function OR use sed to inject the new logic
 * 
 * 5. Test syntax:
 *    node -c /var/www/workforce-democracy/version-b/backend/ai-service.js
 * 
 * 6. Restart backend:
 *    sudo systemctl restart workforce-backend-b.service
 */

module.exports = {
    scoreSourceEnhanced,
    filterSourcesByRelevanceEnhanced
};
