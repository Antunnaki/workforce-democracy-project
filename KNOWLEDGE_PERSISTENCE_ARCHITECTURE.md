# 🧠 Knowledge Persistence & Learning Architecture

**Date**: January 23, 2025  
**Version**: 1.0  
**Philosophy**: Build institutional knowledge while protecting user privacy

---

## 📊 What Gets Learned & Saved

### Current Backend Caching (Basic Level):
```
User asks: "Tell me about candidate Maria Chen's healthcare position"
    ↓
Backend checks cache → NOT FOUND
    ↓
Ollama LLM generates response (5-10 seconds)
    ↓
Response saved to PostgreSQL cache
    ↓
Return to user

Next user asks same question:
    ↓
Backend checks cache → FOUND! ✅
    ↓
Return cached response instantly (no LLM call needed)
```

**What's Saved**: The generated response text  
**What's NOT Saved**: The learning process, context improvements, quality refinements

---

## 🎯 Your Vision: True Knowledge Accumulation

### You Want More Than Caching—You Want Learning!

**Current System** (Basic Cache):
- ❌ Saves individual responses
- ❌ No connection between related queries
- ❌ No quality improvement over time
- ❌ No accumulated context
- ❌ Loses nuance after cache expires

**Improved System** (Knowledge Base):
- ✅ Builds structured knowledge about candidates
- ✅ Connects related information
- ✅ Improves quality based on user feedback
- ✅ Accumulates verified facts over time
- ✅ Never loses validated information

---

## 🏗️ Enhanced Knowledge Architecture

### Three-Layer Knowledge System:

```
┌────────────────────────────────────────────────────────────┐
│                   LAYER 1: RAW DATA                        │
│                (Source of Truth)                           │
├────────────────────────────────────────────────────────────┤
│ • Candidate profiles (name, office, party)                │
│ • Policy positions (timestamped, with sources)            │
│ • Public statements (full text + metadata)                │
│ • Campaign funding (FEC data)                             │
│ • Endorsements (organization + date)                      │
│ • News mentions (articles + sentiment analysis)           │
│                                                            │
│ 🔒 Encryption: AES-256-GCM                                │
│ 📍 Storage: PostgreSQL with encrypted columns             │
└────────────────────────────────────────────────────────────┘
                        ↓ Feeds Into
┌────────────────────────────────────────────────────────────┐
│              LAYER 2: KNOWLEDGE GRAPH                      │
│           (Structured Understanding)                       │
├────────────────────────────────────────────────────────────┤
│ • Entity relationships (candidate ↔ policy ↔ source)     │
│ • Semantic connections (similar positions across time)    │
│ • Confidence scores (how reliable is this info?)         │
│ • Contradiction detection (policy flip-flops)            │
│ • Topic clustering (healthcare positions grouped)         │
│                                                            │
│ 🔒 Encryption: At rest + in transit                       │
│ 📍 Storage: PostgreSQL JSONB + Vector embeddings          │
└────────────────────────────────────────────────────────────┘
                        ↓ Feeds Into
┌────────────────────────────────────────────────────────────┐
│          LAYER 3: AI-GENERATED INSIGHTS                    │
│         (Human-Readable Summaries)                         │
├────────────────────────────────────────────────────────────┤
│ • LLM-generated policy summaries                          │
│ • Comparative analyses (candidate A vs B)                 │
│ • Question-answer pairs                                   │
│ • Quality ratings (user feedback)                         │
│ • Version history (track improvements)                    │
│                                                            │
│ 🔒 Encryption: At rest + in transit                       │
│ 📍 Storage: PostgreSQL with versioning                    │
└────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Enhanced Knowledge Base)

### 1. Raw Data Layer

```sql
-- Candidate base information
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    office TEXT NOT NULL,
    party TEXT NOT NULL,
    state TEXT,
    district TEXT,
    election_date DATE,
    incumbent BOOLEAN DEFAULT FALSE,
    primary_challenger BOOLEAN DEFAULT FALSE,
    
    -- Encrypted sensitive data
    website_url TEXT,
    campaign_email BYTEA, -- Encrypted
    phone_number BYTEA,   -- Encrypted
    
    -- Metadata
    first_seen TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),
    data_quality_score DECIMAL(3,2), -- 0.00 to 1.00
    verification_status TEXT DEFAULT 'unverified', -- unverified, verified, disputed
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', full_name || ' ' || office || ' ' || party)
    ) STORED
);

CREATE INDEX idx_candidates_search ON candidates USING GIN(search_vector);
CREATE INDEX idx_candidates_office ON candidates(office);
CREATE INDEX idx_candidates_election_date ON candidates(election_date);

-- Policy positions (encrypted storage)
CREATE TABLE policy_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    topic TEXT NOT NULL, -- healthcare, climate, education, etc.
    position_summary TEXT NOT NULL,
    position_full_text TEXT, -- Full quote or statement
    
    stance TEXT, -- support, oppose, neutral, nuanced
    confidence_score DECIMAL(3,2), -- How confident are we? 0.00 to 1.00
    
    -- Source tracking
    source_type TEXT NOT NULL, -- website, debate, interview, bill, etc.
    source_url TEXT NOT NULL,
    source_date DATE NOT NULL,
    source_reliability TEXT DEFAULT 'unverified', -- verified, unverified, disputed
    
    -- Encryption for sensitive statements
    encrypted_details BYTEA, -- AES-256-GCM encrypted additional context
    encryption_key_id TEXT, -- Reference to key used
    
    -- Change tracking
    version INTEGER DEFAULT 1,
    replaced_by UUID REFERENCES policy_positions(id), -- If position changed
    created_at TIMESTAMP DEFAULT NOW(),
    last_verified TIMESTAMP DEFAULT NOW(),
    
    -- Metadata
    extracted_by TEXT DEFAULT 'manual', -- manual, llm, web_scraper
    quality_score DECIMAL(3,2) DEFAULT 0.50
);

CREATE INDEX idx_policy_candidate ON policy_positions(candidate_id);
CREATE INDEX idx_policy_topic ON policy_positions(topic);
CREATE INDEX idx_policy_date ON policy_positions(source_date DESC);

-- Public statements (encrypted storage)
CREATE TABLE public_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    statement_text TEXT NOT NULL,
    statement_date DATE NOT NULL,
    context TEXT, -- Where/why statement was made
    
    -- Source tracking
    source_type TEXT NOT NULL, -- speech, tweet, interview, debate, press_release
    source_url TEXT,
    source_title TEXT,
    
    -- Sentiment & analysis (generated by LLM)
    sentiment TEXT, -- positive, negative, neutral
    topics TEXT[], -- Array of related topics
    key_phrases TEXT[], -- Important phrases extracted
    
    -- Encryption for controversial statements
    encrypted_full_context BYTEA,
    encryption_key_id TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_statements_candidate ON public_statements(candidate_id);
CREATE INDEX idx_statements_date ON public_statements(statement_date DESC);
CREATE INDEX idx_statements_topics ON public_statements USING GIN(topics);

-- Campaign funding (public data)
CREATE TABLE campaign_funding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    reporting_period TEXT NOT NULL, -- Q1 2024, Q2 2024, etc.
    total_raised DECIMAL(12,2),
    total_spent DECIMAL(12,2),
    cash_on_hand DECIMAL(12,2),
    
    small_donor_amount DECIMAL(12,2), -- Donations < $200
    small_donor_percentage DECIMAL(5,2),
    
    top_industries JSONB, -- [{"name": "Tech", "amount": 50000}, ...]
    top_donors JSONB,     -- [{"name": "ActBlue", "amount": 100000}, ...]
    
    -- Source
    fec_filing_id TEXT,
    source_url TEXT NOT NULL,
    filing_date DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_funding_candidate ON campaign_funding(candidate_id);
CREATE INDEX idx_funding_period ON campaign_funding(reporting_period);
```

### 2. Knowledge Graph Layer

```sql
-- Vector embeddings for semantic search
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    entity_type TEXT NOT NULL, -- candidate, policy, statement
    entity_id UUID NOT NULL,
    
    -- Vector embedding (for semantic similarity)
    embedding vector(1536), -- OpenAI ada-002 dimension
    
    -- Text that was embedded
    text_content TEXT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    model_version TEXT DEFAULT 'text-embedding-ada-002'
);

-- Vector similarity index (requires pgvector extension)
CREATE INDEX idx_embeddings_vector ON knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX idx_embeddings_entity ON knowledge_embeddings(entity_type, entity_id);

-- Entity relationships (knowledge graph)
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    source_type TEXT NOT NULL, -- candidate, policy, statement, endorsement
    source_id UUID NOT NULL,
    
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    
    relationship_type TEXT NOT NULL, -- supports, opposes, mentions, related_to
    strength DECIMAL(3,2), -- 0.00 to 1.00 (how strong is connection?)
    
    -- Context
    evidence TEXT, -- Why does this relationship exist?
    confidence DECIMAL(3,2), -- How confident are we?
    
    created_at TIMESTAMP DEFAULT NOW(),
    last_validated TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(source_type, source_id, target_type, target_id, relationship_type)
);

CREATE INDEX idx_relationships_source ON entity_relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON entity_relationships(target_type, target_id);

-- Topic clustering
CREATE TABLE topic_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    topic_name TEXT NOT NULL UNIQUE, -- healthcare, climate-change, education
    parent_topic UUID REFERENCES topic_clusters(id), -- Hierarchical topics
    
    description TEXT,
    keywords TEXT[], -- Related keywords
    
    -- Statistics
    candidate_count INTEGER DEFAULT 0,
    policy_count INTEGER DEFAULT 0,
    statement_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_topic_keywords ON topic_clusters USING GIN(keywords);
```

### 3. AI-Generated Insights Layer

```sql
-- LLM-generated summaries (versioned, with quality tracking)
CREATE TABLE llm_generated_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was summarized?
    summary_type TEXT NOT NULL, -- candidate_overview, policy_analysis, comparison
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    -- The generated content (ENCRYPTED)
    summary_text TEXT NOT NULL,
    encrypted_sensitive_details BYTEA, -- Encrypted controversial/sensitive content
    encryption_key_id TEXT,
    
    -- Generation metadata
    llm_model TEXT NOT NULL, -- llama3:8b-instruct, gpt-4, etc.
    prompt_template TEXT NOT NULL, -- Which prompt was used?
    prompt_version TEXT NOT NULL, -- v1.0, v1.1, etc.
    temperature DECIMAL(3,2),
    
    -- Quality metrics
    quality_score DECIMAL(3,2) DEFAULT 0.50, -- User feedback
    usefulness_rating DECIMAL(3,2), -- How useful was this?
    accuracy_rating DECIMAL(3,2), -- How accurate?
    view_count INTEGER DEFAULT 0,
    
    -- User feedback
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    feedback_comments JSONB, -- Array of user feedback
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_version UUID REFERENCES llm_generated_summaries(id),
    replaced_by UUID REFERENCES llm_generated_summaries(id),
    
    -- Lifecycle
    status TEXT DEFAULT 'active', -- active, deprecated, archived
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Optional expiration
    
    UNIQUE(summary_type, entity_type, entity_id, version)
);

CREATE INDEX idx_summaries_entity ON llm_generated_summaries(entity_type, entity_id);
CREATE INDEX idx_summaries_quality ON llm_generated_summaries(quality_score DESC);
CREATE INDEX idx_summaries_status ON llm_generated_summaries(status);

-- Question-answer cache (LLM chat history)
CREATE TABLE qa_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Question asked
    question_text TEXT NOT NULL,
    question_embedding vector(1536), -- For semantic search
    
    -- Context
    candidate_id UUID REFERENCES candidates(id),
    topic TEXT,
    
    -- Answer
    answer_text TEXT NOT NULL,
    answer_sources JSONB, -- Array of source citations
    
    -- Generation metadata
    llm_model TEXT NOT NULL,
    generation_time_ms INTEGER, -- How long did it take?
    
    -- Quality & usage
    quality_score DECIMAL(3,2) DEFAULT 0.50,
    view_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    
    -- Lifecycle
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX idx_qa_question ON qa_cache USING GIN(to_tsvector('english', question_text));
CREATE INDEX idx_qa_candidate ON qa_cache(candidate_id);
CREATE INDEX idx_qa_quality ON qa_cache(quality_score DESC);

-- Improvement tracking (learning over time)
CREATE TABLE knowledge_improvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    improvement_type TEXT NOT NULL, -- correction, enhancement, addition, deprecation
    
    -- What changed?
    before_value TEXT,
    after_value TEXT,
    change_reason TEXT NOT NULL,
    
    -- Who/what triggered improvement?
    triggered_by TEXT, -- user_feedback, automated_check, admin_review
    user_feedback_id UUID,
    
    applied_at TIMESTAMP DEFAULT NOW(),
    applied_by TEXT -- system, admin_user, automated_process
);

CREATE INDEX idx_improvements_entity ON knowledge_improvements(entity_type, entity_id);
CREATE INDEX idx_improvements_date ON knowledge_improvements(applied_at DESC);
```

---

## 🔐 Encryption Architecture

### What Gets Encrypted & Why:

```javascript
// backend/services/encryption.js
import crypto from 'crypto';

class KnowledgeEncryption {
    constructor() {
        // Master key stored in environment variable (never in database!)
        this.masterKey = process.env.KNOWLEDGE_ENCRYPTION_KEY;
        
        // Rotating keys for added security
        this.keyRotationPeriod = 90; // days
    }
    
    /**
     * Encrypt sensitive candidate information
     */
    encryptSensitiveData(plaintext, entityType, entityId) {
        // Generate unique key for this entity (derived from master key)
        const entityKey = this.deriveEntityKey(entityType, entityId);
        
        // Use AES-256-GCM (authenticated encryption)
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', entityKey, iv);
        
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Get authentication tag (ensures data hasn't been tampered with)
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            keyId: this.getCurrentKeyId(),
            algorithm: 'aes-256-gcm'
        };
    }
    
    /**
     * Decrypt sensitive data
     */
    decryptSensitiveData(encryptedData, entityType, entityId) {
        const entityKey = this.deriveEntityKey(entityType, entityId);
        
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            entityKey,
            Buffer.from(encryptedData.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    /**
     * Derive entity-specific key from master key
     */
    deriveEntityKey(entityType, entityId) {
        return crypto.pbkdf2Sync(
            this.masterKey,
            `${entityType}-${entityId}`,
            100000,
            32,
            'sha256'
        );
    }
    
    /**
     * Key rotation (security best practice)
     */
    async rotateKeys() {
        console.log('🔄 Starting key rotation...');
        
        // Generate new master key
        const newMasterKey = crypto.randomBytes(32).toString('hex');
        
        // Re-encrypt all sensitive data with new key
        const sensitiveEntities = await this.getAllEncryptedEntities();
        
        for (const entity of sensitiveEntities) {
            const decrypted = this.decryptSensitiveData(
                entity.encrypted_data,
                entity.entity_type,
                entity.entity_id
            );
            
            // Re-encrypt with new key
            this.masterKey = newMasterKey;
            const reencrypted = this.encryptSensitiveData(
                decrypted,
                entity.entity_type,
                entity.entity_id
            );
            
            await this.updateEncryptedData(entity.id, reencrypted);
        }
        
        console.log('✅ Key rotation complete');
        return newMasterKey;
    }
}

export default new KnowledgeEncryption();
```

### What Gets Encrypted:

| Data Type | Encrypted? | Why? |
|-----------|-----------|------|
| Candidate names | ❌ No | Public information |
| Policy positions (public) | ❌ No | Public statements |
| Campaign websites | ❌ No | Publicly accessible |
| Controversial statements | ✅ Yes | Could be weaponized |
| Candidate contact info | ✅ Yes | Privacy protection |
| User feedback (if PII) | ✅ Yes | Privacy protection |
| LLM prompts with context | ✅ Yes | May contain sensitive info |

---

## 🧠 Knowledge Accumulation (True Learning)

### How Knowledge Improves Over Time:

```javascript
// backend/services/knowledgeLearning.js

class KnowledgeLearningSystem {
    
    /**
     * User provides feedback on LLM-generated summary
     */
    async processFeedback(summaryId, feedback) {
        const { rating, helpful, comments } = feedback;
        
        // 1. Update quality score
        await db.query(`
            UPDATE llm_generated_summaries
            SET quality_score = (quality_score + $1) / 2,
                helpful_votes = helpful_votes + $2,
                not_helpful_votes = not_helpful_votes + $3,
                feedback_comments = feedback_comments || $4::jsonb
            WHERE id = $5
        `, [rating, helpful ? 1 : 0, helpful ? 0 : 1, JSON.stringify([comments]), summaryId]);
        
        // 2. If quality drops below threshold, mark for regeneration
        const summary = await db.query('SELECT * FROM llm_generated_summaries WHERE id = $1', [summaryId]);
        
        if (summary.quality_score < 0.30) {
            console.log(`⚠️ Summary ${summaryId} quality too low, marking for regeneration`);
            await this.scheduleRegeneration(summaryId);
        }
        
        // 3. Learn from feedback (adjust future prompts)
        if (comments) {
            await this.learnFromComments(comments, summary);
        }
    }
    
    /**
     * Learn from user comments to improve future generations
     */
    async learnFromComments(comments, summary) {
        // Extract common complaints
        const complaints = this.extractComplaints(comments);
        
        // Update prompt templates based on feedback
        if (complaints.includes('too_long')) {
            await this.adjustPromptTemplate(summary.prompt_version, 'reduce_length');
        }
        
        if (complaints.includes('missing_sources')) {
            await this.adjustPromptTemplate(summary.prompt_version, 'emphasize_sources');
        }
        
        if (complaints.includes('biased')) {
            await this.adjustPromptTemplate(summary.prompt_version, 'increase_objectivity');
        }
    }
    
    /**
     * Detect contradictions in candidate positions
     */
    async detectContradictions(candidateId) {
        const positions = await db.query(`
            SELECT * FROM policy_positions
            WHERE candidate_id = $1
            ORDER BY source_date ASC
        `, [candidateId]);
        
        // Group by topic
        const byTopic = this.groupByTopic(positions);
        
        for (const [topic, topicPositions] of Object.entries(byTopic)) {
            // Check if stance changed over time
            const stances = topicPositions.map(p => p.stance);
            const uniqueStances = [...new Set(stances)];
            
            if (uniqueStances.length > 1) {
                console.log(`⚠️ Contradiction detected: ${candidateId} on ${topic}`);
                
                // Create relationship noting contradiction
                await db.query(`
                    INSERT INTO entity_relationships (
                        source_type, source_id,
                        target_type, target_id,
                        relationship_type, strength, evidence
                    ) VALUES (
                        'policy', $1,
                        'policy', $2,
                        'contradicts', 0.80,
                        'Candidate stance changed from ' || $3 || ' to ' || $4
                    )
                `, [
                    topicPositions[0].id,
                    topicPositions[topicPositions.length - 1].id,
                    stances[0],
                    stances[stances.length - 1]
                ]);
            }
        }
    }
    
    /**
     * Build semantic connections between candidates
     */
    async buildSemanticConnections() {
        // Get all policy positions
        const policies = await db.query('SELECT * FROM policy_positions');
        
        // Generate embeddings for each policy
        for (const policy of policies) {
            const embedding = await this.generateEmbedding(policy.position_summary);
            
            await db.query(`
                INSERT INTO knowledge_embeddings (
                    entity_type, entity_id, embedding, text_content
                ) VALUES ('policy', $1, $2, $3)
            `, [policy.id, embedding, policy.position_summary]);
        }
        
        // Find similar policies across candidates
        for (const policy of policies) {
            const similarPolicies = await db.query(`
                SELECT entity_id, 1 - (embedding <=> $1) as similarity
                FROM knowledge_embeddings
                WHERE entity_type = 'policy'
                  AND entity_id != $2
                  AND 1 - (embedding <=> $1) > 0.80
                ORDER BY similarity DESC
                LIMIT 10
            `, [policy.embedding, policy.id]);
            
            // Create relationships
            for (const similar of similarPolicies) {
                await db.query(`
                    INSERT INTO entity_relationships (
                        source_type, source_id,
                        target_type, target_id,
                        relationship_type, strength, evidence
                    ) VALUES (
                        'policy', $1,
                        'policy', $2,
                        'similar_position', $3,
                        'Semantic similarity detected'
                    )
                `, [policy.id, similar.entity_id, similar.similarity]);
            }
        }
    }
    
    /**
     * Continuous quality improvement
     */
    async improveKnowledgeQuality() {
        console.log('🔄 Running knowledge quality improvement...');
        
        // 1. Detect contradictions
        const candidates = await db.query('SELECT id FROM candidates');
        for (const candidate of candidates) {
            await this.detectContradictions(candidate.id);
        }
        
        // 2. Build semantic connections
        await this.buildSemanticConnections();
        
        // 3. Regenerate low-quality summaries
        const lowQuality = await db.query(`
            SELECT id FROM llm_generated_summaries
            WHERE quality_score < 0.40
              AND status = 'active'
        `);
        
        for (const summary of lowQuality) {
            await this.regenerateSummary(summary.id);
        }
        
        // 4. Verify outdated information
        const outdated = await db.query(`
            SELECT id FROM policy_positions
            WHERE last_verified < NOW() - INTERVAL '30 days'
        `);
        
        for (const position of outdated) {
            await this.verifyPosition(position.id);
        }
        
        console.log('✅ Knowledge quality improvement complete');
    }
}

export default new KnowledgeLearningSystem();
```

---

## 🔄 Continuous Learning Workflow

```
Daily Automated Tasks:
├── 2:00 AM - Fetch new candidate data from FEC, Ballotpedia
├── 3:00 AM - Run contradiction detection
├── 4:00 AM - Build semantic connections (vector embeddings)
├── 5:00 AM - Regenerate low-quality summaries
└── 6:00 AM - Verify outdated information

Weekly Tasks:
├── Sunday - Full knowledge graph rebuild
├── Wednesday - Prompt template optimization based on feedback
└── Friday - Quality report generation

Monthly Tasks:
├── 1st - Key rotation (encryption security)
├── 15th - Major prompt improvements based on cumulative feedback
└── Last day - Archive expired cache entries
```

---

## 📊 Knowledge Metrics Dashboard

```javascript
// Backend endpoint: GET /api/admin/knowledge-metrics

{
    "totalKnowledge": {
        "candidates": 1247,
        "policyPositions": 8934,
        "publicStatements": 12403,
        "llmSummaries": 3456,
        "qaCache": 8721
    },
    
    "qualityMetrics": {
        "averageSummaryQuality": 0.78,
        "summariesAboveThreshold": "89%",
        "contradictionsDetected": 23,
        "unverifiedPositions": 145
    },
    
    "usageMetrics": {
        "cacheHitRate": "94%",
        "averageResponseTime": "87ms",
        "llmCallsSavedToday": 2341,
        "costSavings": "$14.05"
    },
    
    "learningMetrics": {
        "userFeedbackReceived": 234,
        "summariesImproved": 67,
        "promptVersions": 12,
        "knowledgeGraphEdges": 45678
    }
}
```

---

## ✅ Privacy-First Learning

### What We Learn WITHOUT Compromising Privacy:

**✅ Safe to Learn:**
- Candidate information quality
- Which summaries are helpful vs not helpful
- Common question patterns (anonymized)
- Source reliability scores
- Semantic connections between policies

**❌ Never Learn:**
- Individual user identities
- User search histories
- User political preferences
- IP addresses or locations
- Personal information

---

## 💰 Cost Efficiency

### With Knowledge Accumulation:

**First Month** (building knowledge base):
- LLM API calls: ~$50 (generating initial summaries)
- Database storage: ~$5
- **Total: ~$55**

**Subsequent Months** (mostly cached):
- LLM API calls: ~$5 (new candidates, regenerations)
- Database storage: ~$5
- **Total: ~$10/month**

**Cost savings from caching**: 90%+ reduction after initial build!

---

## 🎯 Summary

### Your Question:
> "Does caching mean the LLM learns and information is saved in a database?"

### Answer:

**Basic Caching**: Just saves individual responses  
**Your Enhanced System**: Builds a true knowledge base!

### What You Get:

✅ **Persistent Knowledge**: Information never lost  
✅ **Quality Improvement**: Summaries get better over time  
✅ **Contradiction Detection**: Automatically finds flip-flops  
✅ **Semantic Understanding**: Connects related policies  
✅ **User Feedback Loop**: Community improves accuracy  
✅ **Encrypted Security**: AES-256-GCM for sensitive data  
✅ **Privacy Protection**: Zero user tracking  
✅ **Cost Efficiency**: 90%+ savings after initial build  
✅ **Continuous Learning**: Daily quality improvements  

This is **institutional knowledge building**—the system gets smarter every day! 🧠✨
