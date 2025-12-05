# Backend Infrastructure Design for Workforce Democracy Project

## Date: 2025-01-XX
## Purpose: Complete backend architecture for live deployment with personalized learning

---

## 🎯 Vision: Organic Learning Based on Private User Data

Create a **privacy-first, personalized learning journey** where users' interactions, interests, and civic engagement privately inform their learning recommendations - without tracking or surveillance.

---

## 🏗️ Architecture Overview

### Technology Stack Recommendation:

```
Frontend (Current)
├─ HTML5, CSS3, Vanilla JavaScript
├─ Chart.js for visualizations
└─ LocalStorage for temporary client-side data

Backend (Recommended)
├─ Node.js + Express (API Server)
├─ PostgreSQL (Primary Database)
├─ Redis (Session & Caching)
├─ MinIO / S3 (File Storage)
└─ Docker (Containerization)

Security & Privacy
├─ JWT Authentication (No Cookies)
├─ Bcrypt Password Hashing
├─ End-to-End Encryption for sensitive data
├─ HTTPS/TLS everywhere
└─ GDPR/CCPA Compliant Data Handling
```

---

## 📊 Database Schema Design

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    privacy_settings JSONB DEFAULT '{"analytics": false, "personalization": true}'::jsonb,
    account_status VARCHAR(20) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### 2. User Profiles Table
```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    district VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(3) DEFAULT 'us',
    interests TEXT[], -- e.g., ['cooperatives', 'unions', 'civic-engagement']
    skill_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    learning_goals TEXT[],
    occupation VARCHAR(100),
    political_preference VARCHAR(50) DEFAULT 'not_specified',
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_interests ON user_profiles USING GIN(interests);
CREATE INDEX idx_profiles_location ON user_profiles(country, state, district);
```

### 3. Learning Resources Table
```sql
CREATE TABLE learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- videos, articles, studies, interactive
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    topics TEXT[],
    author VARCHAR(255),
    source_organization VARCHAR(255),
    publication_date DATE,
    video_id VARCHAR(100), -- YouTube ID
    is_verified BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX idx_resources_type ON learning_resources(type);
CREATE INDEX idx_resources_topics ON learning_resources USING GIN(topics);
CREATE INDEX idx_resources_difficulty ON learning_resources(difficulty_level);
CREATE INDEX idx_resources_rating ON learning_resources(rating_avg DESC);
```

### 4. User Learning Activity Table
```sql
CREATE TABLE user_learning_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- viewed, completed, bookmarked, rated
    progress_percent INTEGER DEFAULT 0, -- 0-100
    time_spent_seconds INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_learning_activity(user_id, created_at DESC);
CREATE INDEX idx_activity_resource ON user_learning_activity(resource_id);
CREATE UNIQUE INDEX idx_user_resource_activity ON user_learning_activity(user_id, resource_id, activity_type);
```

### 5. Civic Votes Table
```sql
CREATE TABLE civic_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bill_id VARCHAR(100) NOT NULL,
    bill_name VARCHAR(500),
    bill_type VARCHAR(100),
    government_level VARCHAR(50), -- federal, state, local
    vote_choice VARCHAR(20) NOT NULL, -- yes, no, abstain
    voted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, bill_id)
);

CREATE INDEX idx_votes_user ON civic_votes(user_id);
CREATE INDEX idx_votes_bill ON civic_votes(bill_id);
CREATE INDEX idx_votes_type ON civic_votes(bill_type);
```

### 6. User Interests & Topics Table
```sql
CREATE TABLE user_topic_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,
    engagement_score INTEGER DEFAULT 1, -- Increments with each interaction
    last_engaged_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, topic)
);

CREATE INDEX idx_topic_engagement ON user_topic_engagement(user_id, engagement_score DESC);
```

### 7. Personalized Recommendations Table
```sql
CREATE TABLE personalized_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    recommendation_score DECIMAL(5,2), -- 0-100
    reason TEXT, -- Why this was recommended
    recommended_at TIMESTAMP DEFAULT NOW(),
    viewed BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false
);

CREATE INDEX idx_recommendations_user ON personalized_recommendations(user_id, recommendation_score DESC);
```

### 8. Local Resources Table (Community-Submitted)
```sql
CREATE TABLE local_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- food, housing, healthcare, legal, employment, etc.
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'us',
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    is_worker_owned BOOLEAN DEFAULT false,
    is_cooperative BOOLEAN DEFAULT false,
    is_union_shop BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    submitted_by UUID REFERENCES users(id),
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' -- pending, approved, rejected
);

CREATE INDEX idx_local_resources_location ON local_resources(country, state, city);
CREATE INDEX idx_local_resources_type ON local_resources(type);
```

---

## 🔐 Privacy-First Personalization Algorithm

### How It Works (WITHOUT Tracking):

```javascript
/**
 * Personalized Learning Recommendation Engine
 * Privacy-First: All calculations done server-side, no client tracking
 */

async function generatePersonalizedRecommendations(userId) {
    // 1. Get user's explicit interests (voluntarily provided)
    const userProfile = await getUserProfile(userId);
    const interests = userProfile.interests || [];
    
    // 2. Analyze user's learning history (opt-in only)
    const learningActivity = await getUserLearningActivity(userId, {
        limit: 50,
        types: ['completed', 'bookmarked', 'highly_rated']
    });
    
    // 3. Analyze civic voting patterns (if user opted in)
    const civicVotes = await getUserCivicVotes(userId, { limit: 20 });
    
    // 4. Calculate topic engagement scores
    const topicScores = calculateTopicEngagement({
        interests,
        learningActivity,
        civicVotes
    });
    
    // 5. Find resources matching high-engagement topics
    const recommendations = await findMatchingResources({
        topics: topicScores,
        difficultyLevel: userProfile.skill_level,
        excludeAlreadyViewed: true,
        userId
    });
    
    // 6. Score and rank recommendations
    const scored = recommendations.map(resource => ({
        ...resource,
        score: calculateRecommendationScore(resource, topicScores, userProfile),
        reason: generateRecommendationReason(resource, topicScores)
    }));
    
    // 7. Return top 10, sorted by score
    return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}

function calculateTopicEngagement({ interests, learningActivity, civicVotes }) {
    const topicScores = {};
    
    // Explicit interests (highest weight)
    interests.forEach(topic => {
        topicScores[topic] = (topicScores[topic] || 0) + 10;
    });
    
    // Learning activity topics
    learningActivity.forEach(activity => {
        activity.resource.topics.forEach(topic => {
            const weight = activity.progress_percent / 10;
            topicScores[topic] = (topicScores[topic] || 0) + weight;
        });
    });
    
    // Civic voting patterns
    civicVotes.forEach(vote => {
        const topic = vote.bill_type;
        topicScores[topic] = (topicScores[topic] || 0) + 5;
    });
    
    return topicScores;
}

function calculateRecommendationScore(resource, topicScores, userProfile) {
    let score = 0;
    
    // Topic relevance (0-50 points)
    resource.topics.forEach(topic => {
        score += (topicScores[topic] || 0);
    });
    
    // Difficulty match (0-20 points)
    if (resource.difficulty_level === userProfile.skill_level) {
        score += 20;
    } else if (isNextLevel(resource.difficulty_level, userProfile.skill_level)) {
        score += 10; // Encourage growth
    }
    
    // Quality score (0-15 points)
    score += (resource.rating_avg / 5) * 15;
    
    // Recency bonus (0-10 points)
    const daysSincePublished = daysSince(resource.publication_date);
    if (daysSincePublished < 90) {
        score += 10 - (daysSincePublished / 9);
    }
    
    // Popularity (0-5 points)
    score += Math.min(resource.view_count / 100, 5);
    
    return Math.round(score);
}
```

---

## 🔒 Privacy & Security Implementation

### 1. Data Collection Opt-In
```javascript
// User explicitly chooses what to share
const privacySettings = {
    personalizedRecommendations: true,  // Use my data for recommendations
    learningAnalytics: false,            // Don't track detailed analytics
    civicEngagementTracking: true,      // Use my votes for recommendations
    communitySharing: false,             // Don't share my activity
    exportData: true                     // Allow me to export my data
};
```

### 2. Data Encryption
```javascript
// Sensitive data encrypted at rest
const encryptSensitiveData = (data) => {
    const algorithm = 'aes-256-gcm';
    const key = process.env.ENCRYPTION_KEY;
    // Encrypt civic votes, learning notes, personal info
    return encrypt(data, key, algorithm);
};
```

### 3. Data Minimization
```javascript
// Only collect what's needed
const collectUserData = {
    required: ['email', 'password'],
    optional: ['district', 'interests', 'occupation'],
    never: ['browsing_history', 'ip_tracking', 'third_party_cookies']
};
```

### 4. Right to Deletion
```javascript
// Complete data deletion on request
async function deleteUserData(userId) {
    await db.transaction(async (trx) => {
        await trx('user_learning_activity').where('user_id', userId).del();
        await trx('civic_votes').where('user_id', userId).del();
        await trx('personalized_recommendations').where('user_id', userId).del();
        await trx('user_profiles').where('user_id', userId).del();
        await trx('users').where('id', userId).del();
    });
    
    // Also delete from backups
    await scheduleBackupDeletion(userId);
}
```

---

## 🚀 API Endpoints Design

### Authentication
```
POST   /api/auth/register          Create account
POST   /api/auth/login             Login
POST   /api/auth/logout            Logout
POST   /api/auth/refresh-token     Refresh JWT
POST   /api/auth/verify-email      Verify email
POST   /api/auth/forgot-password   Password reset
```

### User Profile
```
GET    /api/user/profile           Get user profile
PUT    /api/user/profile           Update profile
GET    /api/user/privacy           Get privacy settings
PUT    /api/user/privacy           Update privacy settings
GET    /api/user/data-export       Export all user data (GDPR)
DELETE /api/user/account           Delete account
```

### Learning Resources
```
GET    /api/resources              List all resources (paginated)
GET    /api/resources/:id          Get single resource
GET    /api/resources/search       Search resources
GET    /api/resources/recommended  Get personalized recommendations
POST   /api/resources              Create resource (admin)
PUT    /api/resources/:id          Update resource (admin)
DELETE /api/resources/:id          Delete resource (admin)
```

### Learning Activity
```
POST   /api/learning/view          Record resource view
POST   /api/learning/progress      Update progress
POST   /api/learning/complete      Mark as completed
POST   /api/learning/bookmark      Bookmark resource
DELETE /api/learning/bookmark/:id  Remove bookmark
POST   /api/learning/rate          Rate resource
GET    /api/learning/history       Get learning history
GET    /api/learning/stats         Get learning statistics
```

### Civic Engagement
```
POST   /api/civic/vote             Record user vote
GET    /api/civic/votes            Get user's voting history
GET    /api/civic/bills            Get available bills
GET    /api/civic/representatives  Get representatives
GET    /api/civic/alignment        Get representative alignment
```

### Local Resources
```
GET    /api/local/resources        Search local resources
POST   /api/local/resources        Submit new resource
GET    /api/local/resources/:id    Get resource details
POST   /api/local/resources/:id/rate  Rate local resource
```

---

## 📈 Learning Journey Features

### 1. Personalized Dashboard
```javascript
{
    "user": {
        "name": "Jane Doe",
        "level": "Intermediate",
        "totalResourcesCompleted": 24,
        "totalTimeSpent": "18 hours 32 minutes",
        "streak": 7 // days in a row
    },
    "recommendations": [
        {
            "id": "uuid",
            "title": "Understanding Worker Cooperatives",
            "type": "video",
            "duration": "15 min",
            "reason": "Based on your interest in workplace democracy",
            "score": 87
        }
    ],
    "continueLearning": [
        {
            "id": "uuid",
            "title": "Building Democratic Workplaces",
            "progress": 67,
            "lastViewed": "2025-01-15T10:30:00Z"
        }
    ],
    "achievements": [
        {
            "title": "First Steps",
            "description": "Completed your first resource",
            "earnedAt": "2025-01-10"
        }
    ]
}
```

### 2. Learning Paths
```javascript
const learningPaths = [
    {
        id: 'workplace-democracy-101',
        title: 'Introduction to Workplace Democracy',
        description: 'Start your journey understanding democratic workplaces',
        level: 'beginner',
        estimatedTime: '4 hours',
        resources: [
            { resourceId: 'uuid-1', order: 1, required: true },
            { resourceId: 'uuid-2', order: 2, required: true },
            { resourceId: 'uuid-3', order: 3, required: false }
        ]
    }
];
```

### 3. Smart Recommendations
- **Based on interests**: "You liked X, try Y"
- **Based on civic votes**: "You voted yes on labor bills, learn about worker rights"
- **Based on completion**: "You finished beginner content, ready for intermediate?"
- **Based on community**: "Popular with users like you"
- **Based on gaps**: "You haven't explored cooperatives yet"

---

## 🔄 Data Synchronization Strategy

### Client → Server Sync
```javascript
// Sync localStorage data to server when user logs in
async function syncClientToServer() {
    const localData = {
        votes: JSON.parse(localStorage.getItem('CivicVotingState') || '{}'),
        bookmarks: JSON.parse(localStorage.getItem('bookmarkedResources') || '[]'),
        preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}')
    };
    
    await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(localData)
    });
    
    // Clear local storage after successful sync
    localStorage.removeItem('CivicVotingState');
}
```

### Server → Client Sync
```javascript
// Load user's data from server when logging in
async function syncServerToClient() {
    const response = await fetch('/api/sync/download', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const serverData = await response.json();
    
    // Populate client with server data
    localStorage.setItem('CivicVotingState', JSON.stringify(serverData.votes));
    localStorage.setItem('userPreferences', JSON.stringify(serverData.preferences));
}
```

---

## 📊 Analytics (Privacy-Respecting)

### Aggregate Statistics Only
```javascript
// NO per-user tracking
// YES aggregate insights

const analytics = {
    totalUsers: 15420,
    mostPopularResources: [
        { title: "How Coops Work", views: 8420 },
        { title: "Mondragon Documentary", views: 7123 }
    ],
    averageEngagement: "12 minutes per resource",
    topicsOfInterest: {
        "workplace-democracy": 45,
        "cooperatives": 38,
        "civic-engagement": 32
    }
};

// User sees: "45% of users are interested in workplace democracy"
// We DON'T know: Which specific users are interested
```

---

## 🎓 Future Enhancement Ideas

### Phase 1 (Launch)
- ✅ User authentication
- ✅ Personalized recommendations
- ✅ Learning activity tracking
- ✅ Civic vote recording
- ✅ Data export (GDPR)

### Phase 2 (Post-Launch)
- 🔮 Community discussions (moderated)
- 🔮 Peer-to-peer mentoring
- 🔮 User-generated content (curated)
- 🔮 Learning paths/courses
- 🔮 Achievements/gamification

### Phase 3 (Long-term)
- 🔮 Mobile app (React Native)
- 🔮 Offline mode with sync
- 🔮 Multilingual support
- 🔮 API for third-party integrations
- 🔮 Advanced analytics dashboard

---

## 💰 Cost Estimation (Monthly)

### Small Scale (1,000-5,000 users)
```
Server (VPS): $40/month
Database (PostgreSQL): $15/month
Storage (S3): $10/month
CDN: $5/month
Domain + SSL: $10/month
Backup Services: $10/month
---------------------------------
Total: ~$90/month
```

### Medium Scale (10,000-50,000 users)
```
Server (Load Balanced): $150/month
Database (Managed): $50/month
Storage: $30/month
CDN: $20/month
Domain + SSL: $10/month
Monitoring: $20/month
---------------------------------
Total: ~$280/month
```

---

## ✅ Implementation Checklist

### Backend Setup
- [ ] Set up Node.js + Express server
- [ ] Configure PostgreSQL database
- [ ] Implement JWT authentication
- [ ] Create all database tables
- [ ] Build RESTful API endpoints
- [ ] Implement encryption for sensitive data
- [ ] Set up Redis for caching
- [ ] Configure CORS properly

### Privacy & Security
- [ ] Implement opt-in data collection
- [ ] Build GDPR data export
- [ ] Create account deletion workflow
- [ ] Set up data encryption
- [ ] Configure HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Set up security headers

### Features
- [ ] Build recommendation algorithm
- [ ] Create personalized dashboard
- [ ] Implement learning progress tracking
- [ ] Build sync mechanism (client ↔ server)
- [ ] Create admin panel for content management
- [ ] Implement email verification
- [ ] Build password reset flow

### Testing & Deployment
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test recommendation algorithm
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to production
- [ ] Set up monitoring
- [ ] Create backup system

---

## 📞 Support & Documentation

When backend is ready, provide:
- API documentation (OpenAPI/Swagger)
- Developer onboarding guide
- Privacy policy (clear, readable)
- Terms of service
- Data handling explanation
- User guide for privacy settings

---

**Status**: ✅ Design Complete - Ready for Implementation  
**Approach**: Privacy-first personalized learning  
**Database**: PostgreSQL with proper indexing  
**Security**: JWT, encryption, GDPR compliant  
**Recommendation Engine**: Multi-factor scoring based on opt-in data  
**Cost**: $90-280/month depending on scale

This backend will enable **truly personalized, organic learning while respecting user privacy**! 🚀🔒
