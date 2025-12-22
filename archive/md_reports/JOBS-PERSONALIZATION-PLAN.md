# Jobs Section Personalization Plan

## Current Status (January 25, 2025)

### ❌ What's NOT There:
- No pre-written personalized text stored
- No profession tracking in personalization system
- Generic intro text for all users

### ✅ What IS There:
- Generic welcoming text: "Discover how 230+ professions transform in democratic workplaces..."
- Location-based personalization (representatives, businesses)
- Jobs chat history stored in localStorage

---

## 📋 Options for Adding Personalized Text

### **Option 1: Add Profession to Personalization System** (Recommended)

**How it works:**
1. Update unified personalization modal to ask for profession (optional field)
2. Store profession in localStorage: `wdp_user_profession`
3. Update jobs intro text dynamically based on stored profession

**Example personalized text:**
```javascript
// If user is a "Teacher"
"Discover how teaching transforms in democratic schools. See how 
educators share decision-making, curriculum design, and leadership 
in worker-owned cooperative schools."

// If user is a "Software Developer"  
"Explore how tech work changes in democratic companies. Learn how 
developers share equity, technical decisions, and project direction 
in worker-owned tech cooperatives."
```

**Benefits:**
- ✅ Truly personalized to user's actual profession
- ✅ Can update text when user changes profession
- ✅ Respects user's privacy choice
- ✅ Works immediately on repeat visits

**Drawbacks:**
- ⏰ Requires asking users for profession upfront
- 🛠️ Need to write templates for common professions

---

### **Option 2: Use Chat History for Dynamic Personalization**

**How it works:**
1. Analyze jobs chat history to detect most-queried professions
2. Update intro text based on their interests
3. No explicit ask - inferred from behavior

**Example:**
```javascript
// If user frequently asks about healthcare roles
"Based on your interest in healthcare, explore how medical 
professionals transform their work in democratic clinics, 
hospitals, and health cooperatives."
```

**Benefits:**
- ✅ No upfront ask - automatic
- ✅ Based on actual interests
- ✅ Updates as interests evolve

**Drawbacks:**
- ⏰ Only works after user has chatted
- 🔍 Requires analysis logic

---

### **Option 3: Smart Generic Text with Local Context**

**How it works:**
1. Keep generic intro but add local context
2. Use stored location to mention local examples
3. Mention number of cooperatives in their area

**Example:**
```javascript
// If user is in San Francisco
"Discover how 230+ professions transform in democratic workplaces. 
In San Francisco, you'll find 47 worker cooperatives across tech, 
food service, healthcare, and creative industries."
```

**Benefits:**
- ✅ No new data collection needed
- ✅ Uses existing location data
- ✅ Adds local relevance

**Drawbacks:**
- ⏳ Still somewhat generic
- 📊 Need cooperative count data by location

---

## 🎯 Recommended Approach: Hybrid

**Combine Option 1 + Option 3:**

1. **First Visit** (No personalization data):
   ```
   "Discover how 230+ professions transform in democratic 
   workplaces. Compare traditional hierarchies with worker-owned 
   cooperatives where you share power, profits, and decisions."
   ```

2. **After Location Set** (Has postcode):
   ```
   "Discover how 230+ professions transform in democratic 
   workplaces. In [City], explore local worker cooperatives 
   and see how your work could be different."
   ```

3. **After Profession Set** (Has profession + location):
   ```
   "Discover how [Profession] transforms in democratic workplaces. 
   In [City], connect with worker cooperatives where [profession]s 
   share decision-making and ownership."
   ```

4. **After Chat Activity** (Has chat history):
   ```
   "Welcome back! Continue exploring [recently queried profession] 
   or discover how 230+ other professions work in democratic 
   settings."
   ```

---

## 🤖 Jobs LLM AI Assistant Integration

### Your Question: "Will this be updated by the jobs LLM AI assistant once we go live?"

**Answer: Partially, but it needs to be designed in**

**What the AI CAN do:**
- ✅ Answer questions about specific professions
- ✅ Compare hierarchical vs democratic workplaces
- ✅ Provide examples of cooperatives
- ✅ Explain how different roles work in democratic settings

**What the AI CANNOT do (currently):**
- ❌ Automatically update the static intro text on the page
- ❌ Persist personalization across sessions (without localStorage)
- ❌ Proactively suggest relevant professions

**What We SHOULD Add:**
1. **Save First Question**: When user asks first question, save the profession mentioned
2. **Update Intro Dynamically**: Use that saved profession to personalize intro text
3. **Remember Context**: AI uses saved profession in future conversations

**Example Implementation:**
```javascript
// When user asks: "Tell me about teaching in cooperatives"
function handleFirstJobsQuestion(question) {
    // Extract profession
    const profession = extractProfession(question); // "teaching"
    
    // Save to localStorage
    localStorage.setItem('wdp_last_queried_profession', profession);
    
    // Update intro text immediately
    updateJobsIntroText(profession);
    
    // AI now knows context for future questions
}
```

---

## 📝 Implementation Plan

### **Phase 1: Add to Personalization Modal** (Quick Win)
1. Add optional "What's your profession?" field
2. Store in localStorage
3. Update intro text if provided
4. **Time**: ~1 hour

### **Phase 2: Location-Based Context** (Easy)
1. Detect if user has location stored
2. Add city name to intro text
3. Mention local cooperatives if available
4. **Time**: ~30 minutes

### **Phase 3: Chat History Analysis** (Medium)
1. Analyze localStorage chat history
2. Extract most-queried professions
3. Update intro based on interests
4. **Time**: ~2 hours

### **Phase 4: AI Integration** (Advanced)
1. AI saves first mentioned profession
2. AI uses saved profession for context
3. Dynamic intro updates after chat
4. **Time**: ~3 hours

---

## 🚀 Quick Action Item

**Would you like me to:**

1. ✅ **Add profession field to personalization modal** (quick, opt-in)
2. ✅ **Create dynamic intro text templates** (I can write these now)
3. ✅ **Implement location-based context** (uses existing data)
4. ✅ **Set up chat history analysis** (for behavior-based personalization)
5. ✅ **All of the above** (comprehensive solution)

Let me know which approach you prefer, and I can implement it right away! 🎯

---

## 💡 Sample Personalized Intro Templates

Here are some pre-written templates I can add now:

### **Generic (Current)**
"Discover how 230+ professions transform in democratic workplaces. Compare traditional hierarchies with worker-owned cooperatives where you share power, profits, and decisions."

### **Healthcare Professions**
"Discover how healthcare transforms in democratic settings. See how doctors, nurses, and therapists share decision-making in worker-owned clinics and health cooperatives."

### **Technology Professions**
"Explore how tech work changes in democratic companies. Learn how developers, designers, and engineers share equity and technical decisions in worker-owned tech cooperatives."

### **Education Professions**
"See how teaching evolves in democratic schools. Discover how educators share curriculum design, leadership, and decision-making in worker-owned cooperative schools."

### **Service Industry**
"Discover how service work transforms with worker ownership. See how restaurant workers, baristas, and hospitality staff share profits and decisions in cooperative businesses."

### **Creative Professions**
"Explore democratic creative work. Learn how artists, designers, and writers collaborate in worker-owned studios, galleries, and creative cooperatives."

---

**I can implement any or all of these right now!** Just let me know your preference. 🚀
