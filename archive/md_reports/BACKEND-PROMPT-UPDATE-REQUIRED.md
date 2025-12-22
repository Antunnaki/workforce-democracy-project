# ⚠️ BACKEND PROMPT UPDATE REQUIRED

**Date**: October 31, 2025  
**Priority**: HIGH  
**Action Required**: Update backend system prompt

---

## 🐛 **User Report**

User tested the Bills/Legislation LLM Assistant and received this response about HR50:

> "It's interesting to note that Rep. Jackson Lee has been a strong advocate for various social justice and human rights issues throughout her career. However, when analyzing bills like HR50, it's essential to look beyond the sponsor's intentions and examine the potential impacts on vulnerable people...
>
> When evaluating bills like HR50, it's crucial to consider the **18 Living Philosophies**, which prioritize human rights and dignity. We should ask questions like: Does this bill treat essential needs like housing, healthcare, or food as rights or commodities?"

---

## 🎯 **Problem Identified**

The backend LLM is using an **old system prompt** that includes:
- ❌ References to "18 Living Philosophies"
- ❌ Human rights advocacy framing
- ❌ Biased language that should be neutral

---

## ✅ **What Should Be Removed**

The backend prompt should **NOT** include:
1. ❌ "18 Living Philosophies" - This was an old framework
2. ❌ Human rights lens framing - Should be educational, not advocacy
3. ❌ Directive to "examine impacts on vulnerable people" - Should be objective
4. ❌ Questions about "rights vs commodities" - Leading questions

---

## ✅ **What Should Be Used Instead**

The backend prompt should match the **Candidate Analysis Chat** approach:

### **Neutral, Educational Tone**:
- ✅ Provide factual bill information
- ✅ Explain legislative process objectively
- ✅ Cite official sources (Congress.gov, CBO, etc.)
- ✅ Avoid political bias or advocacy
- ✅ Present multiple perspectives when relevant

### **Example Good Response**:
> "HR50, the Terry Technical Correction Act, was introduced on January 9, 2023 by Rep. Sheila Jackson Lee (D-TX). According to Congress.gov, the bill was referred to the House Committee on the Judiciary. As of my knowledge cutoff, a detailed summary was not yet available.
>
> To learn more, I recommend checking:
> - Congress.gov for the full bill text and updates
> - Congressional Budget Office (CBO) for fiscal analysis when available
> - Committee hearing records for testimony and discussion
>
> Would you like me to explain more about how bills move through the committee process?"

---

## 🔧 **Where to Make Changes**

### **Backend Server Location:**
```
Your Njalla VPS Server
https://api.workforcedemocracyproject.org
```

### **File to Update:**
Look for the system prompt in your backend code. It's likely in one of these locations:

**Option A: Express/Node.js Backend:**
```javascript
// Example location
const SYSTEM_PROMPT = `
You are a helpful legislative research assistant...
[OLD PROMPT HERE]
`;
```

**Option B: Python/Flask Backend:**
```python
# Example location
SYSTEM_PROMPT = """
You are a helpful legislative research assistant...
[OLD PROMPT HERE]
"""
```

### **Endpoint to Update:**
```
POST /api/groq/bills-chat
```

This endpoint is used by:
- Bills Chat widget (inline chat on bill cards)
- Top-level Bills Chat widget

---

## 📝 **Recommended System Prompt**

### **New Prompt Structure:**

```
You are a helpful, neutral legislative research assistant for the Workforce Democracy Project.

Your role is to:
- Provide factual information about bills, legislation, and the legislative process
- Cite official sources like Congress.gov, CBO, and committee reports
- Explain complex legislative concepts in accessible language
- Remain politically neutral and educational

When discussing bills:
- Start with basic facts: bill number, sponsor, date introduced, current status
- Explain what the bill does in clear, objective language
- Mention committee assignments and procedural steps
- Cite official sources for all claims
- Avoid political advocacy or bias

When you don't have information:
- Clearly state your knowledge cutoff date (April 2023)
- Recommend checking Congress.gov for updates
- Suggest looking at CBO reports for fiscal analysis
- Direct users to committee hearing records

Format your responses:
- Use clear, conversational language
- Break complex topics into digestible parts
- Include relevant citations when available
- End with helpful follow-up suggestions

Remember: You are educational, not advocacy. Present information objectively and let users form their own conclusions.
```

---

## 🧪 **How to Test After Update**

### **Test 1: Ask About a Bill**
```
User: Can you tell me about HR50?
```

**Expected Response**:
- ✅ Factual information (bill number, sponsor, date)
- ✅ Current status (committee assignment)
- ✅ Objective language
- ❌ NO "18 Living Philosophies"
- ❌ NO human rights advocacy framing

### **Test 2: Ask About Impact**
```
User: Who does this bill help or harm?
```

**Expected Response**:
- ✅ "I don't have enough information to analyze specific impacts"
- ✅ "I recommend checking CBO reports for fiscal analysis"
- ✅ "Committee testimony may provide different perspectives"
- ❌ NO leading questions about "vulnerable people"
- ❌ NO advocacy language

---

## ⚙️ **Implementation Steps**

### **Step 1: Locate Backend Code**
1. SSH into your Njalla VPS server
2. Navigate to backend application directory
3. Find the file handling `/api/groq/bills-chat` endpoint

### **Step 2: Update System Prompt**
1. Replace old system prompt with new neutral version
2. Remove all references to "18 Living Philosophies"
3. Remove advocacy framing
4. Add knowledge cutoff date

### **Step 3: Restart Backend**
1. Save changes
2. Restart backend service
3. Verify health check: `https://api.workforcedemocracyproject.org/health`

### **Step 4: Test**
1. Open frontend locally
2. Navigate to Bills Section
3. Click "Ask AI Assistant"
4. Test with multiple questions
5. Verify responses are neutral and educational

---

## 📋 **Checklist**

Before deploying:
- [ ] Located backend system prompt
- [ ] Removed "18 Living Philosophies" references
- [ ] Removed advocacy language
- [ ] Added neutral, educational framing
- [ ] Tested with multiple bill queries
- [ ] Verified responses are objective
- [ ] Restarted backend service
- [ ] Confirmed health check passes

---

## 🔗 **Related Files**

**Frontend (Already Updated)**:
- `js/candidate-analysis.js` - Example of neutral LLM integration
- `js/bills-chat.js` - Frontend that calls backend API
- `js/backend-api.js` - API connection layer

**Backend (Needs Update)**:
- System prompt configuration file (location depends on your setup)
- `/api/groq/bills-chat` endpoint handler

---

## 📞 **Need Help?**

**If you can't find the system prompt:**
1. Search your backend codebase for "18 Living Philosophies"
2. Search for "human rights" in your backend files
3. Search for the string "vulnerable people"
4. Check environment variables (might be in `.env` file)

**If you need the exact Candidate Chat prompt:**
The Candidate Analysis Chat (frontend) doesn't use a system prompt directly, but the pattern should be:
- Factual, neutral, educational
- No advocacy or bias
- Cite sources
- Acknowledge limitations

---

**Priority**: HIGH  
**Status**: ⚠️ Backend Update Required  
**Frontend**: ✅ Already Updated (V36.7.1)  
**Backend**: ❌ Needs Update
