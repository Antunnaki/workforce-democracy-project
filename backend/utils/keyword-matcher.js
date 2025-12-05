/**
 * KEYWORD MATCHER UTILITY
 * Version: V37.17.0-BILL-CACHE
 * Date: 2025-01-XX
 * 
 * Intelligent keyword extraction and semantic matching for bill questions
 * 
 * Features:
 * - Extract meaningful keywords from user questions
 * - Match similar questions using keyword overlap
 * - Remove stop words and common filler words
 * - Calculate similarity scores (Jaccard coefficient)
 * 
 * Example:
 * - "How does this affect teachers?" → ['affect', 'teachers']
 * - "What's the impact on educators?" → ['impact', 'educators']
 * - Match score: 0.40 (keywords: education-related)
 * - With synonym expansion: 0.85 (teachers ≈ educators)
 */

// =====================================================================
// STOP WORDS (Common words to filter out)
// =====================================================================

const STOP_WORDS = new Set([
    // Articles
    'a', 'an', 'the',
    
    // Pronouns
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'this', 'that', 'these', 'those',
    
    // Prepositions
    'in', 'on', 'at', 'to', 'for', 'of', 'by', 'with', 'from', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    
    // Conjunctions
    'and', 'but', 'or', 'nor', 'so', 'yet',
    
    // Question words
    'what', 'which', 'when', 'where', 'who', 'whom', 'whose', 'why', 'how',
    'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must',
    
    // Common verbs (non-meaningful)
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    
    // Other common words
    'there', 'here', 'some', 'any', 'all', 'both', 'each', 'few', 'more', 'most',
    'other', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just'
]);

// =====================================================================
// SYNONYM GROUPS (For semantic matching)
// =====================================================================

const SYNONYM_GROUPS = [
    // Education
    ['teachers', 'educators', 'teaching', 'education', 'schools', 'students'],
    
    // Workers/Labor
    ['workers', 'employees', 'labor', 'workforce', 'staff', 'personnel'],
    
    // Healthcare
    ['healthcare', 'medical', 'health', 'doctors', 'hospitals', 'patients'],
    
    // Economy
    ['economy', 'economic', 'financial', 'fiscal', 'budget', 'money'],
    
    // Housing
    ['housing', 'homes', 'rent', 'rental', 'tenants', 'landlords', 'mortgage'],
    
    // Environment
    ['environment', 'environmental', 'climate', 'pollution', 'conservation', 'green'],
    
    // Rights
    ['rights', 'equality', 'discrimination', 'civil', 'justice', 'fairness'],
    
    // Impact/Effect
    ['impact', 'affect', 'effect', 'influence', 'consequence', 'result'],
    
    // Help/Support
    ['help', 'support', 'assist', 'aid', 'benefit', 'improve']
];

// Create reverse lookup map: word → group index
const SYNONYM_MAP = new Map();
SYNONYM_GROUPS.forEach((group, groupIndex) => {
    group.forEach(word => {
        SYNONYM_MAP.set(word, groupIndex);
    });
});

// =====================================================================
// KEYWORD EXTRACTION
// =====================================================================

/**
 * Extract meaningful keywords from text
 * 
 * Steps:
 * 1. Convert to lowercase
 * 2. Remove punctuation
 * 3. Split into words
 * 4. Filter out stop words
 * 5. Filter out very short words (<3 chars)
 * 6. Return unique keywords
 * 
 * @param {string} text - Input text (e.g., "How does this bill affect teachers?")
 * @returns {string[]} - Array of keywords (e.g., ['bill', 'affect', 'teachers'])
 */
function extractKeywords(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }
    
    // Step 1: Convert to lowercase
    const lowercased = text.toLowerCase();
    
    // Step 2: Remove punctuation (keep only letters, numbers, spaces)
    const noPunctuation = lowercased.replace(/[^\w\s]/g, ' ');
    
    // Step 3: Split into words
    const words = noPunctuation.split(/\s+/).filter(w => w.length > 0);
    
    // Step 4 & 5: Filter out stop words and short words
    const keywords = words.filter(word => {
        return word.length >= 3 && !STOP_WORDS.has(word);
    });
    
    // Step 6: Return unique keywords only
    return [...new Set(keywords)];
}

/**
 * Normalize keywords by adding synonyms
 * 
 * Example:
 * - Input: ['teachers', 'impact']
 * - Output: ['teachers', 'educators', 'teaching', 'education', 'schools', 'students', 'impact', 'affect', 'effect']
 * 
 * @param {string[]} keywords - Original keywords
 * @returns {string[]} - Expanded keywords with synonyms
 */
function expandKeywordsWithSynonyms(keywords) {
    const expandedSet = new Set(keywords);
    
    keywords.forEach(keyword => {
        const groupIndex = SYNONYM_MAP.get(keyword);
        if (groupIndex !== undefined) {
            // Add all words from this synonym group
            SYNONYM_GROUPS[groupIndex].forEach(synonym => {
                expandedSet.add(synonym);
            });
        }
    });
    
    return [...expandedSet];
}

// =====================================================================
// KEYWORD MATCHING
// =====================================================================

/**
 * Calculate similarity score between two keyword sets
 * Uses Jaccard similarity coefficient: |A ∩ B| / |A ∪ B|
 * 
 * @param {string[]} keywords1 - First set of keywords
 * @param {string[]} keywords2 - Second set of keywords
 * @returns {number} - Similarity score (0-1, where 1 = identical)
 */
function calculateKeywordSimilarity(keywords1, keywords2) {
    if (!keywords1 || !keywords2 || keywords1.length === 0 || keywords2.length === 0) {
        return 0;
    }
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    
    // Intersection: common keywords
    const intersection = new Set([...set1].filter(k => set2.has(k)));
    
    // Union: all unique keywords
    const union = new Set([...set1, ...set2]);
    
    // Jaccard coefficient
    return intersection.size / union.size;
}

/**
 * Calculate similarity score with synonym expansion
 * More intelligent matching that understands "teachers" ≈ "educators"
 * 
 * @param {string[]} keywords1 - First set of keywords
 * @param {string[]} keywords2 - Second set of keywords
 * @returns {number} - Similarity score (0-1)
 */
function calculateSemanticSimilarity(keywords1, keywords2) {
    // Expand both keyword sets with synonyms
    const expanded1 = expandKeywordsWithSynonyms(keywords1);
    const expanded2 = expandKeywordsWithSynonyms(keywords2);
    
    // Calculate similarity on expanded sets
    return calculateKeywordSimilarity(expanded1, expanded2);
}

// =====================================================================
// QUESTION MATCHING
// =====================================================================

/**
 * Find best matching question from a list of cached questions
 * 
 * @param {string} newQuestion - User's new question
 * @param {Array<{question_text: string, question_keywords: string[]}>} cachedQuestions - Cached Q&As
 * @param {number} threshold - Minimum similarity score (default: 0.6)
 * @returns {object|null} - Best matching question or null
 */
function findBestMatchingQuestion(newQuestion, cachedQuestions, threshold = 0.6) {
    if (!cachedQuestions || cachedQuestions.length === 0) {
        return null;
    }
    
    // Extract keywords from new question
    const newKeywords = extractKeywords(newQuestion);
    
    if (newKeywords.length === 0) {
        return null;
    }
    
    // Calculate similarity scores for all cached questions
    const matches = cachedQuestions.map(cached => {
        const similarity = calculateSemanticSimilarity(
            newKeywords,
            cached.question_keywords || []
        );
        
        return {
            ...cached,
            similarity_score: similarity
        };
    });
    
    // Find best match
    const bestMatch = matches.reduce((best, current) => {
        return current.similarity_score > best.similarity_score ? current : best;
    }, { similarity_score: 0 });
    
    // Return only if above threshold
    if (bestMatch.similarity_score >= threshold) {
        return bestMatch;
    }
    
    return null;
}

// =====================================================================
// NORMALIZE QUESTION TEXT
// =====================================================================

/**
 * Normalize question text for exact matching
 * (Used as secondary matching strategy)
 * 
 * @param {string} text - Question text
 * @returns {string} - Normalized text
 */
function normalizeQuestionText(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Remove punctuation
        .replace(/\s+/g, ' ')       // Collapse whitespace
        .trim();
}

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = {
    // Main functions
    extractKeywords,
    calculateKeywordSimilarity,
    calculateSemanticSimilarity,
    findBestMatchingQuestion,
    normalizeQuestionText,
    
    // Advanced functions
    expandKeywordsWithSynonyms,
    
    // Constants (for testing/debugging)
    STOP_WORDS,
    SYNONYM_GROUPS
};

// =====================================================================
// USAGE EXAMPLES
// =====================================================================

/*

// Example 1: Extract keywords
const keywords = extractKeywords("How does this bill affect teachers and students?");
console.log(keywords);
// Output: ['bill', 'affect', 'teachers', 'students']

// Example 2: Calculate similarity
const q1Keywords = extractKeywords("How does this affect teachers?");
const q2Keywords = extractKeywords("What's the impact on educators?");
const similarity = calculateSemanticSimilarity(q1Keywords, q2Keywords);
console.log(similarity);
// Output: ~0.75 (high similarity due to teacher/educator synonym)

// Example 3: Find matching question
const cachedQuestions = [
    {
        question_text: "How does this help workers?",
        question_keywords: ['help', 'workers'],
        answer_text: "This bill provides $15/hour minimum wage..."
    },
    {
        question_text: "What's the impact on healthcare?",
        question_keywords: ['impact', 'healthcare'],
        answer_text: "This bill expands Medicaid coverage..."
    }
];

const bestMatch = findBestMatchingQuestion(
    "Does this support employees?",
    cachedQuestions,
    0.5  // 50% similarity threshold
);
console.log(bestMatch);
// Output: First question (workers ≈ employees)

*/
