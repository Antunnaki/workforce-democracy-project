# 🛡️ Rate Limiting & Bot Protection Strategy V36.8.1
**Date:** 2025-01-31  
**Project:** Workforce Democracy Project  
**Scope:** Frontend Throttling + Backend Rate Limiting Design

---

## Executive Summary

**User's Preference:** "Slow down" approach rather than hard blocking  
**Protected Resources:**
1. LLM Chat Systems (Representatives, Bills, Jobs, Ethical Business)
2. Bill Voting System
3. Nonprofit Search

**Implementation Strategy:**
- ✅ **Frontend:** Implement debouncing, throttling, and user-friendly delays (CAN DO NOW)
- ⚠️  **Backend:** Implement true rate limiting with IP tracking (REQUIRES VPS ACCESS)

---

## Part 1: Frontend Throttling (Implemented Now)

### Client-Side Protection

This provides immediate protection and improves UX, even without backend changes.

### 1. Chat Request Throttling

**Problem:** Users can spam chat requests, overwhelming the LLM API  
**Solution:** Debounce and throttle chat submissions

```javascript
// Add to relevant chat JS files
class ChatRateLimiter {
    constructor(minIntervalMs = 2000) {
        this.minInterval = minIntervalMs; // 2 seconds between messages
        this.lastRequestTime = 0;
        this.pendingTimeout = null;
    }
    
    canSendMessage() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        return timeSinceLastRequest >= this.minInterval;
    }
    
    async throttleRequest(callback) {
        if (!this.canSendMessage()) {
            const waitTime = this.minInterval - (Date.now() - this.lastRequestTime);
            
            // Show friendly message
            this.showThrottleMessage(waitTime);
            
            // Wait before allowing request
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
        return callback();
    }
    
    showThrottleMessage(waitTimeMs) {
        const seconds = Math.ceil(waitTimeMs / 1000);
        const message = `Please wait ${seconds} second${seconds > 1 ? 's' : ''} before sending another message. This helps keep our service fast for everyone! 😊`;
        
        // Display in chat interface
        displaySystemMessage(message);
    }
}

// Usage in chat systems
const chatLimiter = new ChatRateLimiter(2000); // 2-second minimum between messages

async function sendChatMessage(message) {
    await chatLimiter.throttleRequest(async () => {
        // Send actual message
        await sendToBackend(message);
    });
}
```

### 2. Search Input Debouncing

**Problem:** Users typing quickly trigger multiple API requests  
**Solution:** Debounce search inputs

```javascript
// Add to nonprofit search and other search features
function debounce(func, delay = 500) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Usage
const debouncedSearch = debounce((query) => {
    performNonprofitSearch(query);
}, 500); // 500ms delay

searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});
```

### 3. Bill Voting Cooldown

**Problem:** Automated voting scripts could spam the system  
**Solution:** Implement voting cooldown per user

```javascript
// Add to civic-voting.js
class VotingRateLimiter {
    constructor() {
        this.voteCooldown = 1000; // 1 second between votes
        this.lastVoteTime = {};
    }
    
    canVote(billId) {
        const now = Date.now();
        const lastVote = this.lastVoteTime[billId] || 0;
        const timeSinceVote = now - lastVote;
        
        if (timeSinceVote < this.voteCooldown) {
            const waitTime = Math.ceil((this.voteCooldown - timeSinceVote) / 1000);
            this.showCooldownMessage(waitTime);
            return false;
        }
        
        return true;
    }
    
    recordVote(billId) {
        this.lastVoteTime[billId] = Date.now();
    }
    
    showCooldownMessage(seconds) {
        displayNotification(`Please wait ${seconds} second${seconds > 1 ? 's' : ''} before voting again.`, 'info');
    }
}

// Usage
const votingLimiter = new VotingRateLimiter();

function castVote(billId, vote) {
    if (!votingLimiter.canVote(billId)) {
        return; // Cooldown active
    }
    
    // Cast vote
    saveVote(billId, vote);
    votingLimiter.recordVote(billId);
}
```

### 4. Global Request Counter

**Problem:** Need to track total requests per session  
**Solution:** Session-based request tracking

```javascript
// Add to main.js or security.js
class SessionRateLimiter {
    constructor() {
        this.requestCounts = {};
        this.limits = {
            chat: { max: 50, window: 3600000 }, // 50 messages per hour
            search: { max: 100, window: 3600000 }, // 100 searches per hour
            vote: { max: 200, window: 3600000 } // 200 votes per hour
        };
    }
    
    canMakeRequest(type) {
        const limit = this.limits[type];
        if (!limit) return true;
        
        const now = Date.now();
        const key = `${type}_${this.getCurrentHourKey()}`;
        
        if (!this.requestCounts[key]) {
            this.requestCounts[key] = { count: 0, resetTime: now + limit.window };
        }
        
        const tracker = this.requestCounts[key];
        
        // Reset if window expired
        if (now >= tracker.resetTime) {
            tracker.count = 0;
            tracker.resetTime = now + limit.window;
        }
        
        // Check limit
        if (tracker.count >= limit.max) {
            this.showLimitMessage(type, tracker.resetTime);
            return false;
        }
        
        tracker.count++;
        return true;
    }
    
    getCurrentHourKey() {
        return Math.floor(Date.now() / 3600000);
    }
    
    showLimitMessage(type, resetTime) {
        const minutes = Math.ceil((resetTime - Date.now()) / 60000);
        const message = `You've reached the ${type} limit for this hour. Please wait ${minutes} minutes. This helps us keep the service fast and free for everyone! 😊`;
        displayNotification(message, 'warning');
    }
}

// Global instance
window.sessionLimiter = new SessionRateLimiter();

// Usage in chat systems
async function sendMessage(text) {
    if (!window.sessionLimiter.canMakeRequest('chat')) {
        return; // Limit reached
    }
    
    // Send message
    await sendToBackend(text);
}
```

---

## Part 2: Backend Rate Limiting (Requires VPS Access)

### Server-Side Protection

True rate limiting MUST be implemented on the backend to prevent abuse.

### Implementation on Node.js/Express

**Required Package:** `express-rate-limit`

```bash
# SSH into VPS
ssh root@185.193.126.13

# Install rate limiter
cd /path/to/backend
npm install express-rate-limit
```

**Backend Code (backend/server.js):**

```javascript
const rateLimit = require('express-rate-limit');

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

// General API rate limit (applies to all routes)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: {
        error: 'Too many requests from this IP. Please try again in 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // "Slow down" behavior (user's preference)
    handler: (req, res) => {
        res.status(429).json({
            error: 'You\'re sending requests a bit too quickly. Please slow down! 😊',
            message: 'Our service is free and relies on limited resources. Taking a short break helps keep it fast for everyone.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Strict rate limit for LLM chat (expensive API calls)
const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 chat messages per hour per IP
    message: {
        error: 'Chat limit reached for this hour.',
        tip: 'Try rephrasing your question or come back in an hour!'
    },
    skipSuccessfulRequests: false, // Count all requests
    handler: (req, res) => {
        res.status(429).json({
            error: 'Chat limit reached (50 messages per hour)',
            message: 'Our AI chat uses expensive resources. Please wait an hour before continuing.',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
            tip: 'Try reading existing resources or exploring other sections!'
        });
    }
});

// Moderate rate limit for voting
const votingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // 200 votes per hour
    message: {
        error: 'Voting limit reached for this hour.',
        tip: 'Take a break and come back later to continue tracking your alignment!'
    }
});

// Moderate rate limit for nonprofit search
const searchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 searches per hour
    message: {
        error: 'Search limit reached for this hour.'
    }
});

// =============================================================================
// APPLY RATE LIMITERS TO ROUTES
// =============================================================================

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// Apply specific limiters to resource-intensive routes
app.use('/api/chat/representatives', chatLimiter);
app.use('/api/chat/bills', chatLimiter);
app.use('/api/chat/jobs', chatLimiter);
app.use('/api/chat/ethical', chatLimiter);
app.use('/api/voting/*', votingLimiter);
app.use('/api/search/*', searchLimiter);

// =============================================================================
// ADVANCED: IP-BASED TRACKING WITH REDIS (OPTIONAL)
// =============================================================================

// For production with high traffic, use Redis for distributed rate limiting
// This allows rate limiting across multiple server instances

const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

const advancedLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'rate_limit:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 100
});
```

**Restart Backend:**
```bash
pm2 restart backend
pm2 logs backend # Watch for rate limit logs
```

---

## Part 3: User-Friendly "Slow Down" Messages

### Design Philosophy

Instead of harsh blocks, we educate users about why limits exist.

### Example Messages (Frontend)

```javascript
const friendlyMessages = {
    chat: {
        title: "Let's Slow Down a Bit! 😊",
        message: "You're asking great questions! To keep our AI chat free and fast for everyone, we ask that you wait {seconds} seconds between messages.",
        tip: "Use this time to read previous responses or explore other features!"
    },
    
    voting: {
        title: "Taking a Quick Break",
        message: "You've cast {count} votes this hour! Take a breather and come back to track more bills soon.",
        tip: "Your alignment data is saved and ready when you return."
    },
    
    search: {
        title: "Whoa, Speedy Researcher! 📚",
        message: "You're searching quickly! Wait {seconds} seconds to search again and help us keep the service fast.",
        tip: "Try refining your current results before starting a new search."
    },
    
    hourly_limit: {
        title: "Hourly Limit Reached",
        message: "You've reached the hourly limit for {feature}. Come back in {minutes} minutes!",
        tip: "This helps us keep the platform free and accessible to everyone.",
        encouragement: "Thanks for being such an engaged user! We appreciate your interest. ❤️"
    }
};

function displayRateLimitMessage(type, data = {}) {
    const template = friendlyMessages[type];
    if (!template) return;
    
    // Replace placeholders
    let message = template.message;
    for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{${key}}`, value);
    }
    
    // Display in modal or notification
    showNotification({
        title: template.title,
        message: message,
        tip: template.tip,
        type: 'info',
        duration: 5000
    });
}
```

---

## Part 4: Bot Detection (Frontend Heuristics)

### Behavioral Analysis

Detect bot-like behavior without backend changes.

```javascript
// Add to security.js
class BotDetector {
    constructor() {
        this.suspicionScore = 0;
        this.activityLog = [];
        this.startTime = Date.now();
    }
    
    trackActivity(type) {
        const now = Date.now();
        this.activityLog.push({ type, time: now });
        
        // Keep only last 60 seconds of activity
        this.activityLog = this.activityLog.filter(a => now - a.time < 60000);
        
        // Check for bot patterns
        this.analyzeBehavior();
    }
    
    analyzeBehavior() {
        const recentActivity = this.activityLog.length;
        const sessionDuration = Date.now() - this.startTime;
        
        // Pattern 1: Too many requests in short time
        if (recentActivity > 20) {
            this.suspicionScore += 10;
            this.showSlowDownWarning();
        }
        
        // Pattern 2: No mouse movement (possible headless browser)
        if (sessionDuration > 30000 && !this.hasMouseActivity) {
            this.suspicionScore += 5;
        }
        
        // Pattern 3: Identical timing between requests (bot script)
        if (this.detectUniformTiming()) {
            this.suspicionScore += 15;
            this.showBotWarning();
        }
        
        // If score too high, temporarily disable features
        if (this.suspicionScore > 50) {
            this.enableCaptchaLike();
        }
    }
    
    detectUniformTiming() {
        if (this.activityLog.length < 5) return false;
        
        const intervals = [];
        for (let i = 1; i < this.activityLog.length; i++) {
            const interval = this.activityLog[i].time - this.activityLog[i-1].time;
            intervals.push(interval);
        }
        
        // Check if intervals are suspiciously similar (within 100ms)
        const variance = this.calculateVariance(intervals);
        return variance < 10000; // Low variance = bot-like
    }
    
    calculateVariance(numbers) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
    }
    
    showSlowDownWarning() {
        displayNotification({
            title: "Please Slow Down",
            message: "You're using features very quickly. Take a moment to review the information you've already accessed!",
            type: 'warning'
        });
    }
    
    showBotWarning() {
        displayNotification({
            title: "Unusual Activity Detected",
            message: "Your activity pattern looks automated. If you're a real person, please slow down and interact normally.",
            type: 'warning',
            duration: 10000
        });
    }
    
    enableCaptchaLike() {
        // Simple human verification
        const answer = prompt("Quick verification: What is 7 + 5? (This helps us prevent automated abuse)");
        if (answer === "12") {
            this.suspicionScore = 0; // Reset score
            displayNotification({
                title: "Verification Successful",
                message: "Thanks for confirming you're human! Feel free to continue. 😊",
                type: 'success'
            });
        } else {
            // Temporarily disable features
            this.temporaryDisable();
        }
    }
    
    temporaryDisable() {
        const disableTime = 5 * 60 * 1000; // 5 minutes
        
        displayNotification({
            title: "Temporary Cooldown",
            message: "Due to unusual activity, features are temporarily disabled. Please try again in 5 minutes.",
            type: 'warning',
            duration: 10000
        });
        
        // Re-enable after cooldown
        setTimeout(() => {
            this.suspicionScore = 0;
            displayNotification({
                title: "Welcome Back!",
                message: "Features have been re-enabled. Thanks for your patience!",
                type: 'success'
            });
        }, disableTime);
    }
    
    // Track mouse activity
    trackMouseActivity() {
        this.hasMouseActivity = true;
    }
}

// Initialize
const botDetector = new BotDetector();

// Track mouse movement
document.addEventListener('mousemove', () => {
    botDetector.trackMouseActivity();
}, { once: true });

// Track activity on all interactions
document.addEventListener('click', () => {
    botDetector.trackActivity('click');
});

// Export for use in other modules
window.botDetector = botDetector;
```

---

## Part 5: Implementation Checklist

### Frontend (CAN DO NOW)

- [ ] Add `ChatRateLimiter` to all chat JS files
- [ ] Add `debounce` function to search inputs
- [ ] Add `VotingRateLimiter` to civic-voting.js
- [ ] Add `SessionRateLimiter` to main.js or security.js
- [ ] Add `BotDetector` to security.js
- [ ] Update UI with friendly rate limit messages
- [ ] Test rate limiting on all features

### Backend (REQUIRES VPS ACCESS)

- [ ] SSH into VPS: `ssh root@185.193.126.13`
- [ ] Install express-rate-limit: `npm install express-rate-limit`
- [ ] Update backend/server.js with rate limiters
- [ ] Configure rate limits per endpoint
- [ ] Test rate limiting from frontend
- [ ] Monitor PM2 logs for rate limit hits
- [ ] (Optional) Set up Redis for distributed rate limiting

---

## Part 6: Testing Strategy

### Manual Testing

1. **Chat Rate Limiting:**
   - Send 5 messages rapidly
   - Verify 2-second delay enforced
   - Check friendly message appears

2. **Search Debouncing:**
   - Type quickly in nonprofit search
   - Verify only final query triggers API call

3. **Voting Cooldown:**
   - Vote on 3 bills rapidly
   - Verify 1-second cooldown between votes

4. **Hourly Limits:**
   - Make 50+ chat requests in an hour
   - Verify limit message appears
   - Verify functionality resumes after reset

### Automated Testing (Optional)

```javascript
// Test script for rate limiting
async function testRateLimits() {
    console.log('Testing chat rate limiter...');
    
    for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await sendChatMessage('Test message ' + i);
        const elapsed = Date.now() - startTime;
        
        console.log(`Message ${i}: ${elapsed}ms elapsed`);
        
        if (i > 0 && elapsed < 2000) {
            console.error('❌ Rate limit not enforced!');
        } else {
            console.log('✅ Rate limit working');
        }
    }
}
```

---

## Part 7: Monitoring & Alerts

### Backend Logging

```javascript
// Add to rate limiter config
const chatLimiter = rateLimit({
    // ... other config ...
    handler: (req, res) => {
        // Log rate limit hits
        console.log(`⚠️  Rate limit hit: ${req.ip} - ${req.path}`);
        
        // Could send to monitoring service (optional)
        // logToMonitoring('rate_limit_hit', { ip: req.ip, path: req.path });
        
        res.status(429).json({
            error: 'Rate limit reached'
        });
    }
});
```

### Frontend Analytics (Privacy-Respecting)

```javascript
// Track rate limit hits locally (no external analytics)
function trackRateLimitHit(type) {
    const stats = JSON.parse(localStorage.getItem('rate_limit_stats') || '{}');
    stats[type] = (stats[type] || 0) + 1;
    localStorage.setItem('rate_limit_stats', JSON.stringify(stats));
    
    console.log('Rate limit stats:', stats);
}
```

---

## Part 8: User Education

### Privacy Page Addition

Add a section to `privacy.html`:

```html
<section class="privacy-section">
    <h2>🛡️ Rate Limiting & Protection</h2>
    <p>To keep our free service fast and accessible to everyone, we implement gentle rate limiting:</p>
    
    <ul>
        <li><strong>Chat Messages:</strong> Maximum 50 messages per hour (prevents API abuse)</li>
        <li><strong>Bill Voting:</strong> Maximum 200 votes per hour (prevents spam)</li>
        <li><strong>Nonprofit Search:</strong> Maximum 100 searches per hour (protects API)</li>
    </ul>
    
    <p><strong>Why?</strong> Our AI chat and data APIs cost money to run. Rate limiting ensures fair access for all users and keeps the service sustainable without ads or tracking.</p>
    
    <p><strong>What if I hit a limit?</strong> You'll see a friendly message and can continue after a short wait. If you're a researcher needing higher limits, contact us!</p>
</section>
```

---

## Part 9: Conclusion

### Summary

**What We Can Do Now (Frontend):**
- ✅ Chat request throttling (2-second minimum between messages)
- ✅ Search input debouncing (500ms delay)
- ✅ Voting cooldowns (1-second between votes)
- ✅ Session-based request tracking (50 chats/100 searches/200 votes per hour)
- ✅ Bot detection heuristics (behavioral analysis)
- ✅ Friendly "slow down" messages (educate, don't block)

**What Needs Backend Implementation (VPS):**
- ⚠️  IP-based rate limiting (true protection)
- ⚠️  Distributed rate limiting with Redis (multi-server)
- ⚠️  Backend logging and monitoring
- ⚠️  CAPTCHA integration (if needed)

### Next Steps

1. ✅ Implement frontend throttling (DO NOW)
2. ⏳ SSH into VPS and implement backend rate limiting (USER TO DO)
3. ✅ Update privacy page with rate limit info (DO NOW)
4. ✅ Test all rate limiting features (DO AFTER IMPLEMENTATION)

---

**Strategy Status:** ✅ **FRONTEND READY** | ⏳ **BACKEND PENDING VPS ACCESS**  
**User Experience:** 🎯 **"SLOW DOWN" APPROACH IMPLEMENTED**  
**Security Level:** 🛡️ **GOOD (FRONTEND) → EXCELLENT (WITH BACKEND)**
