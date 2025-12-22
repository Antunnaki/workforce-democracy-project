# 🔬 Deep Research AI Fix - v37.18.0

## 🚨 PROBLEM IDENTIFIED

The AI chat is returning **generic, shallow responses** without citations because:

1. **Frontend calls:** `/api/civic/llm-chat/submit` (generic chat, no research)
2. **Should call:** `/api/ai/bills/analyze` (deep research with DuckDuckGo + Congress.gov)

---

## 🎯 SOLUTION: Smart Router Middleware

Create a **middleware** that detects when users ask about:
- Representative voting records
- Healthcare/policy votes
- Bill sponsorship
- Legislative history

And **automatically routes** those queries to the Deep Research endpoint.

---

## 📋 IMPLEMENTATION PLAN

### **Option 1: Backend Smart Router** (Recommended)
Modify `/api/civic/llm-chat/submit` to detect deep research queries and route to `/api/ai/bills/analyze` internally.

### **Option 2: Frontend Detection**
Modify `js/chat-clean.js` to detect keywords like "vote", "voting record", "healthcare bill" and call `/api/ai/bills/analyze` directly.

### **Option 3: Unified Endpoint**
Create `/api/civic/ai-analyze` that combines both:
- Generic chat for simple questions
- Deep research for complex policy/voting questions

---

## 🔧 QUICK FIX (Option 1 - Backend)

Modify `civic-routes.js` to add smart routing:

```javascript
// V37.18.0: SMART ROUTER FOR DEEP RESEARCH
router.post('/llm-chat/submit', async (req, res) => {
    const { message, context } = req.body;
    
    // Detect if query needs deep research
    const deepResearchKeywords = [
        'vote', 'voting record', 'voted', 'healthcare bill',
        'sponsored', 'co-sponsored', 'legislation', 'policy',
        'support', 'oppose', 'congressman', 'senator'
    ];
    
    const needsDeepResearch = deepResearchKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
    
    // If representative context + deep research query → use AI Bills endpoint
    if (context?.viewingContent?.type === 'representative' && needsDeepResearch) {
        console.log('🔬 [SMART ROUTER] Routing to Deep Research AI');
        
        // Forward to deep research endpoint
        const billAnalysisReq = {
            query: message,
            context: {
                representative: context.viewingContent.name,
                state: context.viewingContent.state || 'Unknown'
            }
        };
        
        // Call internal deep research function
        return handleDeepResearchQuery(billAnalysisReq, res);
    }
    
    // Otherwise, use generic chat
    console.log('💬 [SMART ROUTER] Using generic chat');
    return handleGenericChat(req, res);
});
```

---

## 🧪 TESTING

After implementing, test with:

1. **Generic question:** "What is the ACA?"
   - Should use: Generic chat (fast, no citations needed)
   
2. **Deep research question:** "How does Chuck Schumer vote on healthcare?"
   - Should use: Deep Research AI
   - Should return: Specific bill citations (S.1932, H.R.3590, etc.)
   - Should have: DuckDuckGo search results
   - Should cite: Congress.gov voting records

---

## 📊 EXPECTED OUTPUT (After Fix)

```
Chuck Schumer has consistently voted in favor of healthcare expansion:

• S.1932 (2005) - Deficit Reduction Act: Voted AGAINST Medicaid cuts [1]
• H.R.3590 (2010) - Affordable Care Act: Voted YES (60-39) [2]  
• S.Amdt.667 (2017) - Skinny Repeal: Voted NO to protect ACA [3]
• H.R.3 (2019) - Lower Drug Costs Now Act: Voted YES [4]

As a senior Democrat, Schumer has also sponsored 12 healthcare-related bills 
since 2005, focusing on Medicare expansion and prescription drug pricing reform.

Sources:
[1] Congress.gov - S.1932 Budget Reconciliation Vote
[2] Congress.gov - H.R.3590 Patient Protection and Affordable Care Act
[3] Congress.gov - S.Amdt.667 to H.R.1628
[4] Congress.gov - H.R.3 Elijah E. Cummings Lower Drug Costs Now Act
```

---

## 🚀 DEPLOYMENT

1. Update `civic-routes.js` with smart router
2. Test on Version B (port 3002)
3. Verify deep research works on GenSpark
4. Deploy to Version A (production)

---

**Current Status:** Diagnosis complete, awaiting implementation decision
