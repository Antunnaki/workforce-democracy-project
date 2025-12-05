# 🗳️ Candidate Analysis Backend Implementation Guide

**Date**: January 23, 2025  
**Backend**: Njalla VPS + Node.js + PostgreSQL + Ollama  
**Philosophy**: Privacy-first, knowledge-accumulating, secure

---

## 🎯 Overview

This guide implements the candidate analysis feature using the established backend infrastructure with **enhanced knowledge persistence** as defined in `KNOWLEDGE_PERSISTENCE_ARCHITECTURE.md`.

### Key Features:
- ✅ Encrypted sensitive data (AES-256-GCM)
- ✅ Knowledge accumulation (learns and improves over time)
- ✅ Semantic search (vector embeddings)
- ✅ Contradiction detection (tracks policy changes)
- ✅ Quality improvement (user feedback loop)
- ✅ Privacy protection (zero user tracking)

---

## 📁 Backend File Structure

```
backend/
├── routes/
│   └── candidates.js           # API endpoints
├── services/
│   ├── encryption.js           # AES-256-GCM encryption
│   ├── knowledgeLearning.js    # Knowledge accumulation
│   ├── llmService.js           # Ollama integration
│   └── vectorSearch.js         # Semantic search
├── models/
│   └── candidate.js            # Database models
├── middleware/
│   ├── rateLimit.js            # API rate limiting
│   └── security.js             # Security headers
├── jobs/
│   └── knowledgeImprovement.js # Daily quality tasks
└── sql/
    └── candidate_schema.sql    # Database schema
```

---

## 🗄️ Database Setup

### Run this SQL to create all tables:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector";  -- For embeddings (install pgvector first)

-- ==============================================
-- LAYER 1: RAW DATA
-- ==============================================

-- Candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    office TEXT NOT NULL,
    party TEXT NOT NULL,
    state TEXT,
    district TEXT,
    election_date DATE,
    incumbent BOOLEAN DEFAULT FALSE,
    primary_challenger BOOLEAN DEFAULT FALSE,
    
    -- Public information
    website_url TEXT,
    campaign_slogan TEXT,
    bio_summary TEXT,
    
    -- Encrypted sensitive data
    contact_email BYTEA, -- Encrypted
    phone_number BYTEA,  -- Encrypted
    encryption_key_id TEXT,
    
    -- Metadata
    first_seen TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),
    data_quality_score DECIMAL(3,2) DEFAULT 0.50,
    verification_status TEXT DEFAULT 'unverified',
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', full_name || ' ' || office || ' ' || party || ' ' || COALESCE(bio_summary, ''))
    ) STORED,
    
    CONSTRAINT valid_quality_score CHECK (data_quality_score >= 0 AND data_quality_score <= 1)
);

CREATE INDEX idx_candidates_search ON candidates USING GIN(search_vector);
CREATE INDEX idx_candidates_office ON candidates(office);
CREATE INDEX idx_candidates_election_date ON candidates(election_date);
CREATE INDEX idx_candidates_party ON candidates(party);

-- Policy positions
CREATE TABLE policy_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    topic TEXT NOT NULL, -- healthcare, climate, education, economy, etc.
    position_summary TEXT NOT NULL,
    position_full_text TEXT,
    
    stance TEXT, -- support, oppose, neutral, nuanced
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    
    -- Source tracking
    source_type TEXT NOT NULL, -- website, debate, interview, bill_sponsorship, tweet
    source_url TEXT NOT NULL,
    source_date DATE NOT NULL,
    source_reliability TEXT DEFAULT 'unverified',
    
    -- Encryption for sensitive/controversial content
    encrypted_details BYTEA,
    encryption_key_id TEXT,
    
    -- Versioning (track position changes)
    version INTEGER DEFAULT 1,
    replaced_by UUID REFERENCES policy_positions(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    last_verified TIMESTAMP DEFAULT NOW(),
    
    -- Quality
    extracted_by TEXT DEFAULT 'manual', -- manual, llm, web_scraper
    quality_score DECIMAL(3,2) DEFAULT 0.50,
    
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CONSTRAINT valid_quality CHECK (quality_score >= 0 AND quality_score <= 1)
);

CREATE INDEX idx_policy_candidate ON policy_positions(candidate_id);
CREATE INDEX idx_policy_topic ON policy_positions(topic);
CREATE INDEX idx_policy_date ON policy_positions(source_date DESC);

-- Public statements
CREATE TABLE public_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    statement_text TEXT NOT NULL,
    statement_date DATE NOT NULL,
    context TEXT, -- Where/why statement was made
    
    source_type TEXT NOT NULL, -- speech, tweet, interview, debate, press_release
    source_url TEXT,
    source_title TEXT,
    
    -- AI-generated analysis
    sentiment TEXT, -- positive, negative, neutral
    topics TEXT[], -- Array of related topics
    key_phrases TEXT[],
    
    -- Encryption
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

-- Campaign funding
CREATE TABLE campaign_funding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    reporting_period TEXT NOT NULL, -- Q1_2024, Q2_2024, etc.
    total_raised DECIMAL(12,2),
    total_spent DECIMAL(12,2),
    cash_on_hand DECIMAL(12,2),
    
    small_donor_amount DECIMAL(12,2),
    small_donor_percentage DECIMAL(5,2),
    
    top_industries JSONB,
    top_donors JSONB,
    
    -- Source
    fec_filing_id TEXT,
    source_url TEXT NOT NULL,
    filing_date DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(candidate_id, reporting_period)
);

CREATE INDEX idx_funding_candidate ON campaign_funding(candidate_id);
CREATE INDEX idx_funding_period ON campaign_funding(reporting_period);

-- Endorsements
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    
    endorser_name TEXT NOT NULL,
    endorser_type TEXT NOT NULL, -- organization, individual, publication
    endorsement_date DATE NOT NULL,
    
    source_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_endorsements_candidate ON endorsements(candidate_id);

-- ==============================================
-- LAYER 2: KNOWLEDGE GRAPH
-- ==============================================

-- Vector embeddings for semantic search
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    entity_type TEXT NOT NULL, -- candidate, policy, statement
    entity_id UUID NOT NULL,
    
    embedding vector(1536), -- OpenAI ada-002 or similar
    text_content TEXT NOT NULL,
    
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    
    relationship_type TEXT NOT NULL, -- supports, opposes, contradicts, similar_to
    strength DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    
    evidence TEXT,
    confidence DECIMAL(3,2) DEFAULT 0.50,
    
    created_at TIMESTAMP DEFAULT NOW(),
    last_validated TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(source_type, source_id, target_type, target_id, relationship_type)
);

CREATE INDEX idx_relationships_source ON entity_relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON entity_relationships(target_type, target_id);

-- ==============================================
-- LAYER 3: AI-GENERATED INSIGHTS
-- ==============================================

-- LLM-generated summaries (with versioning)
CREATE TABLE llm_generated_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    summary_type TEXT NOT NULL, -- candidate_overview, policy_analysis, comparison
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Generated content
    summary_text TEXT NOT NULL,
    encrypted_sensitive_details BYTEA,
    encryption_key_id TEXT,
    
    -- Generation metadata
    llm_model TEXT NOT NULL, -- llama3:8b-instruct, gpt-4, claude-3
    prompt_template TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    temperature DECIMAL(3,2) DEFAULT 0.70,
    generation_time_ms INTEGER,
    
    -- Quality metrics
    quality_score DECIMAL(3,2) DEFAULT 0.50,
    usefulness_rating DECIMAL(3,2),
    accuracy_rating DECIMAL(3,2),
    view_count INTEGER DEFAULT 0,
    
    -- User feedback
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    feedback_comments JSONB,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_version UUID REFERENCES llm_generated_summaries(id),
    replaced_by UUID REFERENCES llm_generated_summaries(id),
    
    -- Lifecycle
    status TEXT DEFAULT 'active', -- active, deprecated, archived
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    
    UNIQUE(summary_type, entity_type, entity_id, version)
);

CREATE INDEX idx_summaries_entity ON llm_generated_summaries(entity_type, entity_id);
CREATE INDEX idx_summaries_quality ON llm_generated_summaries(quality_score DESC);
CREATE INDEX idx_summaries_status ON llm_generated_summaries(status);

-- Question-answer cache
CREATE TABLE qa_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    question_text TEXT NOT NULL,
    question_embedding vector(1536),
    
    context_candidate_id UUID REFERENCES candidates(id),
    context_topic TEXT,
    
    answer_text TEXT NOT NULL,
    answer_sources JSONB,
    
    llm_model TEXT NOT NULL,
    generation_time_ms INTEGER,
    
    -- Quality & usage
    quality_score DECIMAL(3,2) DEFAULT 0.50,
    view_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX idx_qa_question ON qa_cache USING GIN(to_tsvector('english', question_text));
CREATE INDEX idx_qa_candidate ON qa_cache(context_candidate_id);
CREATE INDEX idx_qa_embedding ON qa_cache USING ivfflat (question_embedding vector_cosine_ops);

-- Knowledge improvements tracking
CREATE TABLE knowledge_improvements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    improvement_type TEXT NOT NULL, -- correction, enhancement, addition, deprecation
    
    before_value TEXT,
    after_value TEXT,
    change_reason TEXT NOT NULL,
    
    triggered_by TEXT, -- user_feedback, automated_check, admin_review
    user_feedback_id UUID,
    
    applied_at TIMESTAMP DEFAULT NOW(),
    applied_by TEXT
);

CREATE INDEX idx_improvements_entity ON knowledge_improvements(entity_type, entity_id);
CREATE INDEX idx_improvements_date ON knowledge_improvements(applied_at DESC);

-- ==============================================
-- ENCRYPTION KEY MANAGEMENT
-- ==============================================

-- Encryption keys (stored separately from encrypted data)
CREATE TABLE encryption_keys (
    key_id TEXT PRIMARY KEY,
    key_hash TEXT NOT NULL, -- SHA-256 hash of key (for verification)
    algorithm TEXT NOT NULL DEFAULT 'aes-256-gcm',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    status TEXT DEFAULT 'active', -- active, rotated, revoked
    
    UNIQUE(key_hash)
);

CREATE INDEX idx_keys_status ON encryption_keys(status);
```

---

## 🔧 Backend Implementation

### 1. Encryption Service

**File: `backend/services/encryption.js`**

```javascript
import crypto from 'crypto';
import { db } from '../database.js';

class EncryptionService {
    constructor() {
        // Master key from environment (NEVER commit to git!)
        this.masterKey = process.env.KNOWLEDGE_ENCRYPTION_KEY;
        
        if (!this.masterKey || this.masterKey.length < 32) {
            throw new Error('KNOWLEDGE_ENCRYPTION_KEY must be set and at least 32 bytes');
        }
        
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32; // 256 bits
        this.ivLength = 16;  // 128 bits
        this.saltLength = 64;
        this.tagLength = 16;
    }
    
    /**
     * Encrypt sensitive data
     */
    encrypt(plaintext, entityType, entityId) {
        // Derive entity-specific key
        const salt = crypto.randomBytes(this.saltLength);
        const key = crypto.pbkdf2Sync(
            this.masterKey,
            salt,
            100000,
            this.keyLength,
            'sha512'
        );
        
        // Generate random IV
        const iv = crypto.randomBytes(this.ivLength);
        
        // Encrypt
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Get auth tag
        const authTag = cipher.getAuthTag();
        
        // Combine: salt + iv + encrypted + authTag
        const combined = Buffer.concat([
            salt,
            iv,
            Buffer.from(encrypted, 'hex'),
            authTag
        ]);
        
        return combined;
    }
    
    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedBuffer, entityType, entityId) {
        // Extract components
        const salt = encryptedBuffer.slice(0, this.saltLength);
        const iv = encryptedBuffer.slice(this.saltLength, this.saltLength + this.ivLength);
        const authTag = encryptedBuffer.slice(-this.tagLength);
        const encrypted = encryptedBuffer.slice(
            this.saltLength + this.ivLength,
            -this.tagLength
        );
        
        // Derive same key
        const key = crypto.pbkdf2Sync(
            this.masterKey,
            salt,
            100000,
            this.keyLength,
            'sha512'
        );
        
        // Decrypt
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    /**
     * Generate key ID for tracking
     */
    generateKeyId() {
        return `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
}

export default new EncryptionService();
```

### 2. LLM Service (Ollama Integration)

**File: `backend/services/llmService.js`**

```javascript
import axios from 'axios';
import { db } from '../database.js';

class LLMService {
    constructor() {
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'llama3:8b-instruct';
    }
    
    /**
     * Generate candidate analysis
     */
    async analyzeCandidatePolicy(candidate, policyPositions) {
        const prompt = this.buildCandidateAnalysisPrompt(candidate, policyPositions);
        
        const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 2048
            }
        });
        
        return response.data.response;
    }
    
    /**
     * Answer question about candidate
     */
    async answerCandidateQuestion(question, candidate, context) {
        // Check semantic cache first
        const cachedAnswer = await this.searchSemanticCache(question, candidate.id);
        if (cachedAnswer) {
            console.log('✅ Semantic cache hit');
            return cachedAnswer;
        }
        
        // Generate new answer
        const prompt = this.buildQuestionAnswerPrompt(question, candidate, context);
        
        const startTime = Date.now();
        const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 1024
            }
        });
        const generationTime = Date.now() - startTime;
        
        // Cache the answer
        await this.cacheQuestionAnswer(
            question,
            response.data.response,
            candidate.id,
            generationTime
        );
        
        return response.data.response;
    }
    
    /**
     * Build prompt for candidate analysis
     */
    buildCandidateAnalysisPrompt(candidate, policyPositions) {
        const positionsText = policyPositions.map(p => 
            `- ${p.topic}: ${p.position_summary} (Source: ${p.source_type}, ${p.source_date})`
        ).join('\n');
        
        return `You are an objective political analyst. Provide a balanced, factual analysis of this candidate.

CANDIDATE: ${candidate.full_name}
OFFICE: ${candidate.office}
PARTY: ${candidate.party}
${candidate.incumbent ? 'STATUS: Incumbent' : ''}
${candidate.primary_challenger ? 'STATUS: Primary Challenger' : ''}

POLICY POSITIONS:
${positionsText}

Provide a comprehensive analysis covering:
1. **Overview**: Brief introduction (2-3 sentences)
2. **Key Policy Positions**: Summarize major positions by topic
3. **Political Experience**: Based on available information
4. **Notable Stances**: Any distinctive or notable positions
5. **Sources**: Cite where information came from

Be objective and fact-based. Acknowledge when information is limited. Format in markdown.`;
    }
    
    /**
     * Build prompt for Q&A
     */
    buildQuestionAnswerPrompt(question, candidate, context) {
        return `You are a helpful, objective assistant answering questions about election candidates.

CANDIDATE: ${candidate.full_name}
OFFICE: ${candidate.office}
PARTY: ${candidate.party}

CONTEXT: ${JSON.stringify(context)}

USER QUESTION: ${question}

Provide a clear, factual answer based on available information. If you don't have enough information, say so honestly. Cite sources when possible. Keep response concise (2-4 paragraphs).`;
    }
    
    /**
     * Search semantic cache for similar questions
     */
    async searchSemanticCache(question, candidateId) {
        // Generate embedding for question
        const embedding = await this.generateEmbedding(question);
        
        // Search for similar questions (cosine similarity > 0.85)
        const result = await db.query(`
            SELECT answer_text, answer_sources, quality_score
            FROM qa_cache
            WHERE context_candidate_id = $1
              AND 1 - (question_embedding <=> $2::vector) > 0.85
              AND quality_score > 0.40
              AND expires_at > NOW()
            ORDER BY 1 - (question_embedding <=> $2::vector) DESC
            LIMIT 1
        `, [candidateId, JSON.stringify(embedding)]);
        
        if (result.rows.length > 0) {
            // Update access count
            await db.query(`
                UPDATE qa_cache
                SET access_count = access_count + 1,
                    last_accessed = NOW()
                WHERE context_candidate_id = $1
                  AND 1 - (question_embedding <=> $2::vector) > 0.85
            `, [candidateId, JSON.stringify(embedding)]);
            
            return result.rows[0].answer_text;
        }
        
        return null;
    }
    
    /**
     * Cache question-answer pair
     */
    async cacheQuestionAnswer(question, answer, candidateId, generationTimeMs) {
        const embedding = await this.generateEmbedding(question);
        
        await db.query(`
            INSERT INTO qa_cache (
                question_text, question_embedding, context_candidate_id,
                answer_text, llm_model, generation_time_ms
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            question,
            JSON.stringify(embedding),
            candidateId,
            answer,
            this.model,
            generationTimeMs
        ]);
    }
    
    /**
     * Generate embedding for semantic search
     */
    async generateEmbedding(text) {
        // Using OpenAI's embedding API (or local alternative)
        // For now, return placeholder (you'd integrate actual embedding service)
        return new Array(1536).fill(0);
    }
}

export default new LLMService();
```

---

## 🚀 Complete implementation continues in next message...

*This establishes the foundation for the enhanced knowledge persistence system with encryption, semantic search, and quality tracking.*
