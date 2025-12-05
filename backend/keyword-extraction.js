/**
 * KEYWORD EXTRACTION & QUERY ENHANCEMENT
 * 
 * Extracts relevant keywords from user questions to improve news search relevance
 * Handles constitutional topics, policy issues, legislation, and current events
 * 
 * Version: v37.4.0
 */

// =============================================================================
// CONSTITUTIONAL AMENDMENTS - US SPECIFIC KNOWLEDGE
// =============================================================================

const AMENDMENT_TOPICS = {
    '1': {
        keywords: ['first amendment', 'free speech', 'freedom of religion', 'freedom of press', 'assembly rights'],
        topics: ['civil liberties', 'constitution', 'free speech', 'religious freedom']
    },
    '2': {
        keywords: ['second amendment', 'gun rights', 'firearms', 'right to bear arms', 'gun control'],
        topics: ['gun rights', 'constitution', 'firearms policy']
    },
    '4': {
        keywords: ['fourth amendment', 'search and seizure', 'privacy rights', 'warrant requirements'],
        topics: ['privacy', 'civil liberties', 'police powers']
    },
    '5': {
        keywords: ['fifth amendment', 'due process', 'self-incrimination', 'double jeopardy'],
        topics: ['criminal justice', 'civil liberties']
    },
    '13': {
        keywords: ['thirteenth amendment', 'slavery abolition', 'involuntary servitude', 'prison labor'],
        topics: ['slavery', 'civil rights', 'criminal justice', 'prison reform']
    },
    '14': {
        keywords: ['fourteenth amendment', 'equal protection', 'due process', 'citizenship rights'],
        topics: ['civil rights', 'equality', 'citizenship']
    },
    '15': {
        keywords: ['fifteenth amendment', 'voting rights', 'racial discrimination', 'suffrage'],
        topics: ['voting rights', 'civil rights', 'racial justice']
    },
    '19': {
        keywords: ['nineteenth amendment', 'women suffrage', 'women voting rights', 'gender equality', 'women rights'],
        topics: ['womens rights', 'voting rights', 'gender equality', 'suffrage', 'feminism']
    },
    '26': {
        keywords: ['twenty sixth amendment', 'voting age', 'youth voting', '18 year old vote'],
        topics: ['voting rights', 'youth politics']
    }
};

// =============================================================================
// POLICY TOPIC MAPPING
// =============================================================================

const POLICY_PATTERNS = {
    // Healthcare
    healthcare: {
        patterns: [/health\s*care|medicare|medicaid|insurance|hospital|medical|doctor|patient/i],
        keywords: ['healthcare', 'medical care', 'health insurance', 'public health'],
        topics: ['healthcare', 'public health', 'medicare', 'medicaid']
    },
    
    // Education
    education: {
        patterns: [/education|school|student|teacher|university|college|tuition/i],
        keywords: ['education policy', 'public schools', 'student debt', 'education funding'],
        topics: ['education', 'student rights', 'education funding']
    },
    
    // Climate & Environment
    climate: {
        patterns: [/climate|environment|carbon|renewable|pollution|fossil fuel|green energy/i],
        keywords: ['climate change', 'environmental policy', 'renewable energy', 'carbon emissions'],
        topics: ['climate', 'environment', 'energy policy']
    },
    
    // Labor & Workers
    labor: {
        patterns: [/labor|union|worker|wage|minimum wage|strike|employment|job|workplace/i],
        keywords: ['labor rights', 'workers rights', 'unions', 'wages', 'employment'],
        topics: ['labor', 'workers rights', 'unions', 'employment']
    },
    
    // Immigration
    immigration: {
        patterns: [/immigr|border|asylum|refugee|deportation|visa|undocumented/i],
        keywords: ['immigration policy', 'border security', 'asylum seekers', 'refugee rights'],
        topics: ['immigration', 'border policy', 'refugee rights']
    },
    
    // Criminal Justice
    criminal_justice: {
        patterns: [/prison|jail|police|criminal justice|incarceration|reform|parole|probation/i],
        keywords: ['criminal justice reform', 'police accountability', 'mass incarceration', 'prison reform'],
        topics: ['criminal justice', 'police reform', 'prison system']
    },
    
    // Voting Rights
    voting: {
        patterns: [/voting|election|voter|ballot|suffrage|disenfranchise|gerrymandering/i],
        keywords: ['voting rights', 'election integrity', 'voter access', 'suffrage'],
        topics: ['voting rights', 'elections', 'democracy']
    },
    
    // Housing
    housing: {
        patterns: [/housing|homeless|rent|eviction|affordable housing|tenant|landlord/i],
        keywords: ['housing policy', 'affordable housing', 'homelessness', 'tenant rights'],
        topics: ['housing', 'homelessness', 'urban policy']
    },
    
    // Foreign Policy
    foreign_policy: {
        patterns: [/foreign policy|war|military|nato|sanctions|diplomacy|international/i],
        keywords: ['foreign policy', 'international relations', 'military intervention', 'diplomacy'],
        topics: ['foreign policy', 'military', 'international relations']
    },
    
    // Economic Policy
    economy: {
        patterns: [/economy|economic|inflation|recession|jobs report|unemployment|gdp/i],
        keywords: ['economic policy', 'inflation', 'unemployment', 'economic growth'],
        topics: ['economy', 'economic policy', 'jobs']
    },
    
    // LGBTQ Rights
    lgbtq: {
        patterns: [/lgbtq|transgender|gay|lesbian|queer|same.sex|gender identity/i],
        keywords: ['LGBTQ rights', 'transgender rights', 'marriage equality', 'gender identity'],
        topics: ['LGBTQ rights', 'civil rights', 'gender equality']
    },
    
    // Reproductive Rights
    reproductive: {
        patterns: [/abortion|reproductive|roe.v.wade|contraception|planned parenthood/i],
        keywords: ['reproductive rights', 'abortion access', 'reproductive healthcare', 'bodily autonomy'],
        topics: ['reproductive rights', 'abortion', 'womens health']
    }
};

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract relevant keywords and topics from user message
 * Returns enhanced search query for better news source matching
 */
function extractSearchKeywords(userMessage) {
    const keywords = new Set();
    const topics = new Set();
    const queryLower = userMessage.toLowerCase();
    
    // v37.4.1: Define stopWords at top so it can be used in name extraction
    const stopWords = new Set([
        'what', 'would', 'could', 'should', 'be', 'is', 'are', 'was', 'were',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'if', 'when', 'where', 'why', 'how',
        'this', 'that', 'these', 'those', 'have', 'has', 'had', 'do', 'does',
        'did', 'will', 'shall', 'may', 'might', 'can', 'about', 'tell', 'me'
    ]);
    
    console.log(`🔍 Extracting keywords from: "${userMessage}"`);
    
    // ==========================================================================
    // 1. DETECT CONSTITUTIONAL AMENDMENTS
    // ==========================================================================
    
    const amendmentMatch = userMessage.match(/(\d+)(?:st|nd|rd|th)\s+amendment/i);
    if (amendmentMatch) {
        const amendmentNum = amendmentMatch[1];
        if (AMENDMENT_TOPICS[amendmentNum]) {
            const amendment = AMENDMENT_TOPICS[amendmentNum];
            amendment.keywords.forEach(k => keywords.add(k));
            amendment.topics.forEach(t => topics.add(t));
            console.log(`  ⚖️  Detected ${amendmentNum}th Amendment → topics: ${amendment.topics.join(', ')}`);
        }
    }
    
    // ==========================================================================
    // 2. DETECT POLICY AREAS
    // ==========================================================================
    
    Object.entries(POLICY_PATTERNS).forEach(([policyArea, config]) => {
        const matches = config.patterns.some(pattern => pattern.test(queryLower));
        if (matches) {
            config.keywords.forEach(k => keywords.add(k));
            config.topics.forEach(t => topics.add(t));
            console.log(`  📋 Detected policy area: ${policyArea} → ${config.topics.join(', ')}`);
        }
    });
    
    // ==========================================================================
    // 3. DETECT SPECIFIC ENTITIES (POLITICIANS, LEGISLATION, EVENTS)
    // ==========================================================================
    
    // V37.18.18: Extract capitalized words (likely names or legislation)
    // FIX 1: Handle ALL CAPS input by converting to title case FIRST
    // FIX 2: Clean punctuation BEFORE testing regex (handles "Mamdani's" → "Mamdani")
    // FIX 3: Filter out generic question words AND common policy terms
    const titleCaseMessage = userMessage.replace(/\b[A-Z]{2,}\b/g, word => 
        word.charAt(0) + word.slice(1).toLowerCase()
    );
    
    // Generic words to exclude (question words, common nouns, etc.)
    const excludedWords = new Set([
        'What', 'Would', 'Could', 'Should', 'The', 'If', 'Be', 'Is', 'Are', 'Has', 'Have', 
        'When', 'Where', 'Who', 'How', 'Why', 'Which', 'Whose', 'Whom',
        'Policies', 'Policy', 'Plans', 'Plan', 'Position', 'Positions', 'Views', 'View',
        'Stance', 'Opinion', 'Opinions', 'Platform', 'Platforms'
    ]);
    
    // Split on spaces and extract each word separately
    const extractWords = titleCaseMessage.split(/\s+/);
    extractWords.forEach(word => {
        // V37.18.21: NUCLEAR FIX - Remove 's' if word ends with non-letter + 's'
        // This catches ALL apostrophe variants: Mamdani's, Mamdani's, Mamdani`s, etc.
        // Strategy: Clean punctuation FIRST, then check if result ends with 's' from possessive
        let cleanWord = word.replace(/[^A-Za-z]/g, '');  // "Mamdani's" → "Mamdanis"
        
        // If original word had punctuation before final 's', remove that 's'
        if (word.match(/[^A-Za-z]s$/i) && cleanWord.endsWith('s')) {
            cleanWord = cleanWord.slice(0, -1);  // "Mamdanis" → "Mamdani"
        }
        
        // Match single capitalized words that are likely proper nouns (names, legislation)
        if (/^[A-Z][a-z]+$/.test(cleanWord) && !excludedWords.has(cleanWord)) {
            keywords.add(cleanWord);          // Add "Mamdani"
            keywords.add(cleanWord.toLowerCase());  // Add "mamdani"
        }
    });
    
    // v37.4.1 / V37.18.18: Extract TWO-WORD names only (prevents "What Are Mamdani" extraction)
    // Use titleCaseMessage to ensure consistent capitalization
    const potentialNames = titleCaseMessage.match(/\b[a-z]{3,}\s+[a-z]{4,}\b/gi) || [];
    potentialNames.forEach(name => {
        // CRITICAL: Only add TWO-WORD names (not three+)
        const nameParts = name.toLowerCase().split(/\s+/);
        if (nameParts.length === 2 && 
            !stopWords.has(nameParts[0]) && 
            !stopWords.has(nameParts[1])) {
            keywords.add(name);  // Add full name (e.g., "Zohran Mamdani")
            nameParts.forEach(part => keywords.add(part));  // Add individual parts ("zohran", "mamdani")
        }
    });
    
    // ==========================================================================
    // 4. DETECT TEMPORAL CONTEXT
    // ==========================================================================
    
    if (queryLower.match(/current|recent|latest|today|this week|this year/)) {
        keywords.add('current events');
        keywords.add('breaking news');
    }
    
    if (queryLower.match(/history|historical|past|since|during|era/)) {
        keywords.add('historical context');
    }
    
    // ==========================================================================
    // 5. DETECT HYPOTHETICAL/ANALYTICAL QUESTIONS
    // ==========================================================================
    
    if (queryLower.match(/what (would|could) (happen|be|occur)/)) {
        keywords.add('analysis');
        keywords.add('implications');
    }
    
    if (queryLower.match(/repeal|overturn|eliminate|abolish/)) {
        keywords.add('policy change');
        keywords.add('legal analysis');
    }
    
    // ==========================================================================
    // 6. EXTRACT IMPORTANT NOUNS (FALLBACK)
    // ==========================================================================
    
    // v37.4.1: stopWords now defined at top of function
    const words = queryLower.split(/\s+/);
    
    // V37.20.5: DEBUG - Log first word processing
    let isFirstWord = true;
    
    words.forEach(word => {
        // V37.18.21: NUCLEAR FIX - Remove 's' if word ends with non-letter + 's'
        // This catches ALL apostrophe variants: mamdani's, mamdani's, mamdani`s, etc.
        const originalWord = word;
        
        if (isFirstWord && originalWord.includes("'")) {
            console.log(`🔍 [KEYWORD-EXTRACTION DEBUG] Processing word with apostrophe: "${originalWord}"`);
        }
        
        word = word.replace(/[^a-z]/g, '');  // Clean punctuation: "mamdani's" → "mamdanis"
        
        if (isFirstWord && originalWord.includes("'")) {
            console.log(`   After cleaning punctuation: "${word}"`);
            console.log(`   Regex test /[^a-z]s$/: ${originalWord.match(/[^a-z]s$/) ? 'MATCH' : 'NO MATCH'}`);
            console.log(`   word.endsWith('s'): ${word.endsWith('s')}`);
        }
        
        // If original had punctuation before final 's', remove that 's'
        if (originalWord.match(/[^a-z]s$/) && word.endsWith('s')) {
            word = word.slice(0, -1);  // "mamdanis" → "mamdani"
            if (isFirstWord && originalWord.includes("'")) {
                console.log(`   ✅ Removed possessive 's': "${word}"`);
                isFirstWord = false;
            }
        } else if (isFirstWord && originalWord.includes("'")) {
            console.log(`   ❌ Did NOT remove 's' (regex or endsWith failed)`);
            isFirstWord = false;
        }
        
        // v37.4.1: Changed from > 4 to > 2 to capture names like "ron"
        // Add if meaningful (longer than 2 chars and not a stop word)
        if (word.length > 2 && !stopWords.has(word)) {
            keywords.add(word);
        }
    });
    
    // ==========================================================================
    // 7. BUILD FINAL SEARCH QUERY
    // ==========================================================================
    
    const keywordArray = Array.from(keywords);
    const topicArray = Array.from(topics);
    
    // Primary query: most relevant keywords
    const primaryQuery = keywordArray.slice(0, 5).join(' OR ');
    
    // Fallback: include topics if keywords too sparse
    let finalQuery = primaryQuery;
    if (keywordArray.length < 3 && topicArray.length > 0) {
        finalQuery = [...keywordArray, ...topicArray.slice(0, 3)].join(' OR ');
    }
    
    console.log(`  ✅ Extracted keywords: [${keywordArray.slice(0, 8).join(', ')}]`);
    console.log(`  ✅ Extracted topics: [${topicArray.slice(0, 5).join(', ')}]`);
    console.log(`  🔎 Final search query: "${finalQuery}"`);
    
    return {
        query: finalQuery,
        keywords: keywordArray,
        topics: topicArray,
        originalMessage: userMessage
    };
}

// =============================================================================
// RELEVANCE SCORING
// =============================================================================

/**
 * Score how relevant an article is to the extracted keywords/topics
 * Returns 0-100 score
 */
function calculateRelevanceScore(article, extractedData) {
    let score = 0;
    const { keywords, topics } = extractedData;
    
    const titleLower = (article.title || '').toLowerCase();
    const excerptLower = (article.excerpt || article.contentSnippet || '').toLowerCase();
    const combined = `${titleLower} ${excerptLower}`;
    
    // Check title for exact keyword matches (high weight)
    keywords.forEach(keyword => {
        if (titleLower.includes(keyword.toLowerCase())) {
            score += 20;
        }
    });
    
    // Check excerpt for keyword matches (medium weight)
    keywords.forEach(keyword => {
        if (excerptLower.includes(keyword.toLowerCase())) {
            score += 10;
        }
    });
    
    // Check for topic matches (medium weight)
    topics.forEach(topic => {
        if (titleLower.includes(topic.toLowerCase())) {
            score += 15;
        }
        if (excerptLower.includes(topic.toLowerCase())) {
            score += 8;
        }
    });
    
    // V37.18.29: POLICY QUERY BONUS SCORING
    // If query is about policies, give credit for articles discussing specific policy areas
    if (keywords.some(k => k.match(/polic(y|ies)/i))) {
        // Policy area keywords that might not be in the original query
        const policyAreas = [
            'housing', 'rent', 'tenant', 'affordable',
            'healthcare', 'medicare', 'medicaid',
            'labor', 'worker', 'union', 'wage',
            'education', 'school', 'student',
            'climate', 'environment', 'green',
            'criminal justice', 'police', 'reform',
            'tax', 'budget', 'revenue'
        ];
        
        // Count how many policy areas are mentioned
        const policyMentions = policyAreas.filter(area => combined.includes(area)).length;
        
        if (policyMentions > 0) {
            score += policyMentions * 3; // 3 points per policy area mentioned
            // console.log(`  📊 Policy bonus: +${policyMentions * 3} (${policyMentions} areas)`);
        }
    }
    
    // V37.18.29: CANDIDATE NAME VARIATIONS
    // If query mentions a candidate, also check for name variations
    const candidateNames = {
        'mamdani': ['zohran', 'zohran mamdani', 'shah mamdani'],
        'aoc': ['ocasio-cortez', 'alexandria ocasio-cortez', 'rep. ocasio-cortez'],
        'bernie': ['sanders', 'bernie sanders', 'sen. sanders']
    };
    
    keywords.forEach(keyword => {
        const keyLower = keyword.toLowerCase();
        if (candidateNames[keyLower]) {
            const variations = candidateNames[keyLower];
            variations.forEach(variant => {
                if (combined.includes(variant)) {
                    score += 15; // Bonus for name variation match
                }
            });
        }
    });
    
    return Math.min(score, 100); // Cap at 100
}

// =============================================================================
// FACT-CHECKING REQUIREMENTS
// =============================================================================

/**
 * Determine if source needs extra fact-checking based on bias classification
 */
function getFactCheckingLevel(biasClassification) {
    const levels = {
        'independent_progressive': {
            level: 'standard',
            checks: ['cross-reference major claims'],
            priority: 1
        },
        'state_media_nonwestern': {
            level: 'moderate',
            checks: ['verify claims about home country', 'cross-reference with independent sources'],
            priority: 2
        },
        'establishment_liberal': {
            level: 'enhanced',
            checks: [
                'verify progressive policy claims',
                'check for pro-establishment bias',
                'cross-reference labor/union coverage'
            ],
            priority: 3
        },
        'state_media_western': {
            level: 'heavy',
            checks: [
                'verify all foreign policy claims',
                'check for pro-NATO/pro-Western bias',
                'cross-reference with non-Western sources',
                'verify claims about adversary nations'
            ],
            priority: 4
        },
        'wire_service': {
            level: 'enhanced',
            checks: [
                'verify corporate bias',
                'check for omitted progressive perspective',
                'cross-reference with independent sources'
            ],
            priority: 3
        }
    };
    
    return levels[biasClassification] || levels['establishment_liberal'];
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    extractSearchKeywords,
    calculateRelevanceScore,
    getFactCheckingLevel,
    AMENDMENT_TOPICS,
    POLICY_PATTERNS
};
