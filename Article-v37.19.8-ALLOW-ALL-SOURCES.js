/**
 * Article Model - Pre-indexed news articles for fast searching
 * v37.19.0 - Democracy Now Archive
 */

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    // Core article data
    title: {
        type: String,
        required: true,
        index: true
    },
    url: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    source: {
        type: String,
        required: true,
        index: true
        // v37.19.8: Removed enum to allow DuckDuckGo sources to be auto-indexed
        // Trusted sources: Democracy Now, The Intercept, Jacobin, ProPublica, Common Dreams, Truthout, Drop Site News
        // Auto-indexed: Any source found via DuckDuckGo fallback
    },
    
    // Content
    excerpt: {
        type: String,
        default: ''
    },
    fullText: {
        type: String,
        default: ''
    },
    
    // For fast text search
    searchableText: {
        type: String,
        index: 'text' // MongoDB text index for full-text search
    },
    
    // Metadata
    publishedDate: {
        type: Date,
        index: true
    },
    author: String,
    tags: [String],
    
    // Categorization
    topics: [{
        type: String,
        enum: ['politics', 'labor', 'housing', 'healthcare', 'climate', 'justice', 'immigration', 'education', 'economy']
    }],
    
    // For relevance scoring
    keywords: [String],
    
    // Tracking
    scrapedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
articleSchema.index({ source: 1, publishedDate: -1 });
articleSchema.index({ searchableText: 'text' });
articleSchema.index({ keywords: 1 });

// Pre-save hook to create searchable text
articleSchema.pre('save', function(next) {
    this.searchableText = `${this.title} ${this.excerpt} ${this.fullText} ${this.keywords.join(' ')}`.toLowerCase();
    next();
});

// Static methods for searching
articleSchema.statics.searchByKeywords = async function(keywords, options = {}) {
    const {
        source = null,
        limit = 10,
        minDate = null
    } = options;
    
    // Extract candidate name if present (more specific search)
    const candidateMatch = keywords.match(/\b(mamdani|aoc|ocasio-cortez|bernie|sanders)\b/i);
    
    let query;
    if (candidateMatch) {
        // If searching for a specific person, require their name AND search other terms
        const candidateName = candidateMatch[0];
        const otherTerms = keywords.replace(candidateName, '').trim();
        
        // Use regex for candidate name (must be present) + text search for other terms
        query = {
            $and: [
                {
                    $or: [
                        { title: { $regex: candidateName, $options: 'i' } },
                        { searchableText: { $regex: candidateName, $options: 'i' } },
                        { excerpt: { $regex: candidateName, $options: 'i' } }
                    ]
                }
            ]
        };
        
        // Add text search for other terms if present
        if (otherTerms) {
            query.$text = { $search: otherTerms };
        }
    } else {
        // General search (no specific candidate)
        query = {
            $text: { $search: keywords }
        };
    }
    
    if (source) {
        query.source = source;
    }
    
    if (minDate) {
        query.publishedDate = { $gte: minDate };
    }
    
    const projection = query.$text ? { score: { $meta: 'textScore' } } : {};
    const sort = query.$text 
        ? { score: { $meta: 'textScore' }, publishedDate: -1 }
        : { publishedDate: -1 };
    
    return this.find(query)
        .select(projection)
        .sort(sort)
        .limit(limit);
};

module.exports = mongoose.model('Article', articleSchema);
