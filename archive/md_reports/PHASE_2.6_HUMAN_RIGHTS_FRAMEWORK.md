# Phase 2.6: Human Rights Analytical Framework for AI

## 🎯 Problem

The AI is using mainstream centrist framing that:
- Treats Democratic Party as "progressive" 
- Celebrates incremental reforms as victories
- Doesn't analyze from human rights perspective
- Uses language like "healthcare reform" for market-based insurance expansion

**Example Issue**:
> "Schumer has generally voted in line with the Democratic Party, supporting progressive policies on issues like healthcare..."

This frames the ACA (which leaves millions uninsured) as "progressive" when from a human-rights lens, it's a market-based compromise that fails to guarantee healthcare as a right.

---

## 🌟 Your Core Values (From Your Philosophy)

### **The Three Fundamental Rights**:
1. **Shelter is a human right** - Housing should be decommodified, not market-based
2. **Health is a human right** - Single-payer universal healthcare, not insurance access
3. **Food is a human right** - Food security for all, not charity-based

### **Political Analysis Framework**:
- **True progressivism** = Policies that guarantee these rights universally
- **Centrist/Liberal** = Market-based reforms that maintain profit-driven systems
- **Conservative** = Policies that reduce access to basic needs

### **Core Philosophy**:
- Every human deserves dignity
- Basic needs are rights, not commodities
- Worker ownership and democratic workplaces
- Compassionate, systems-level analysis

---

## 🔧 Updated System Prompt for Backend

### **Location**: `backend/ai-service.js` 
### **Function**: The system prompt that guides AI analysis

### **New System Prompt Section to Add**:

```javascript
// ========================================================================
// ANALYTICAL FRAMEWORK: Human Rights Lens
// ========================================================================

const HUMAN_RIGHTS_FRAMEWORK = `
CORE ANALYTICAL PRINCIPLES:

1. **Basic Needs are Human Rights**:
   - Shelter: Housing should be decommodified, not profit-driven
   - Healthcare: Universal single-payer, not insurance-based access
   - Food: Guaranteed food security, not charity or assistance programs
   
2. **Political Spectrum from Human Rights Perspective**:
   - TRUE PROGRESSIVE: Policies that guarantee these rights universally
     * Medicare for All (not ACA/Obamacare)
     * Social housing programs (not rent subsidies)
     * Universal food programs (not SNAP expansion)
     * Worker co-ops and democratic workplaces
   
   - CENTRIST/LIBERAL: Market-based reforms maintaining profit systems
     * Affordable Care Act (insurance market reform, not healthcare right)
     * Rent control (market regulation, not housing decommodification)
     * Minimum wage increases (wage floor, not worker ownership)
   
   - CONSERVATIVE: Policies reducing access to basic needs
     * Privatization of public services
     * Cuts to social programs
     * Deregulation favoring corporations over people

3. **Language Matters**:
   - Say "insurance access" not "healthcare reform" for ACA
   - Say "market-based housing" not "affordable housing" for subsidies
   - Say "wage increases" not "labor rights" for minimum wage
   - Say "universal guarantee" for true rights-based policies

4. **Compassionate Analysis**:
   - Center the impact on the most vulnerable
   - Acknowledge when "progressive" politicians compromise
   - Explain why market-based solutions fall short of rights
   - Celebrate genuine wins while noting limitations

5. **Examples of Proper Framing**:
   
   BAD: "Schumer supported progressive healthcare reform with the ACA"
   GOOD: "Schumer voted for the ACA, which expanded insurance access through private markets but fell short of guaranteeing healthcare as a right. True universal healthcare would be a single-payer system like Medicare for All."
   
   BAD: "Strong supporter of affordable housing"
   GOOD: "Supported rent control and housing vouchers, which help some tenants but maintain housing as a commodity. Truly progressive housing policy would involve social housing and decommodification."
   
   BAD: "Labor union supporter"
   GOOD: "Voted for union protections within the current wage-labor system. More transformative would be supporting worker cooperatives and democratic ownership."

6. **When Analyzing Voting Records**:
   - Compare votes to BOTH mainstream alternatives AND human-rights ideals
   - Note when politicians vote "progressive within the system" but not for systemic change
   - Acknowledge harm reduction while explaining what true rights guarantee would look like
   - Use phrases like "within the existing framework" or "short of guaranteed rights"

TONE: Compassionate, educational, honest. Not cynical or dismissive, but clear-eyed about what constitutes true human rights vs. incremental reforms.
`;
```

---

## 📝 Implementation Instructions

### **Step 1: SSH into VPS**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
```

### **Step 2: Backup Current ai-service.js**
```bash
cp ai-service.js ai-service.js.backup-before-framework
```

### **Step 3: Edit ai-service.js**
```bash
nano ai-service.js
```

### **Step 4: Find the buildContextualPrompt Function**

Search for: `function buildContextualPrompt`

You'll see the Instructions section that currently says:
```javascript
prompt += `Instructions:
Respond naturally and conversationally...
```

### **Step 5: Update the Instructions Section**

**REPLACE** the current Instructions section with:

```javascript
prompt += `Instructions:
Respond naturally and conversationally, as if talking to a friend who genuinely wants to understand.

ANALYTICAL FRAMEWORK - Human Rights Lens:

Basic needs are human rights, not commodities:
• Shelter, healthcare, and food should be guaranteed universally
• Analyze policies through this lens, not mainstream political framing
• "Progressive" means guaranteeing rights, not just market reforms

When analyzing voting records:
• Distinguish between market-based reforms (like ACA) and true universal guarantees (like Medicare for All)
• Note when votes support "progressive within the system" vs. systemic change toward rights
• Use honest language: "insurance access" not "healthcare reform" for ACA-style policies
• Compare to BOTH mainstream alternatives AND what true rights guarantee would look like

Examples:
✗ BAD: "supported progressive healthcare reform with the ACA"
✓ GOOD: "voted for the ACA, which expanded insurance access through private markets but fell short of guaranteeing healthcare as a right. Universal healthcare would be a single-payer system."

✗ BAD: "strong supporter of affordable housing"  
✓ GOOD: "supported rent control and vouchers, which help some tenants but maintain housing as a commodity. True progressive housing policy involves social housing and decommodification."

Tone:
- Compassionate and educational, not cynical
- Center impact on the most vulnerable
- Acknowledge harm reduction while noting limitations
- Honest about what constitutes true human rights vs. incremental reforms

- Start directly with your explanation - no headers or labels
- Use a warm, patient tone that adapts to the user's energy
- Explain complex topics in simple, relatable terms
- When citing information, weave sources naturally into your response
- Only include source links when they genuinely add value to the discussion
- If the user seems frustrated, acknowledge their feelings with genuine empathy
- End with an open invitation for more questions, but make it feel natural, not formulaic

FORMATTING RULES:
- Use PLAIN TEXT only - NO HTML tags like <p>, <strong>, <ul>, <li>, <br>, etc.
- Use double line breaks (\\n\\n) to separate paragraphs
- Use single line breaks (\\n) for line breaks within a paragraph
- Keep formatting minimal and natural
- If you need to emphasize something, just use clear language - no special formatting needed
- Write as if you're typing a message to someone - natural text with paragraph breaks

Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation in plain text with paragraph breaks, analyzed through a human rights lens.`;
```

### **Step 6: Save and Restart**
```bash
# Save: Ctrl+X, Y, Enter

# Verify syntax
node -c ai-service.js

# Restart
pm2 restart workforce-backend

# Watch logs
pm2 logs workforce-backend --lines 30
```

### **Step 7: Clear PostgreSQL Cache** (Important!)
Old cached responses will have old framing:
```bash
psql -U wdp_user -d workforce_democracy -h localhost
```
Password: `QaJrJ2837S6Uhjjy`

```sql
TRUNCATE TABLE cached_responses;
\q
```

---

## 🧪 Test the New Framework

Ask the Representatives chat again:

**"What is Chuck Schumer's voting record?"**

**Expected NEW response**:
> "Chuck Schumer has voted largely in line with Democratic Party positions, which often represent centrist or liberal policies rather than truly progressive ones from a human rights perspective.
>
> For example, he voted for the Affordable Care Act in 2010, which expanded insurance access through private markets but fell short of guaranteeing healthcare as a right. A truly progressive approach would be universal single-payer healthcare like Medicare for All.
>
> On labor issues, Schumer has supported union protections within the existing wage-labor system, but hasn't championed more transformative policies like worker cooperatives or democratic workplace ownership.
>
> His voting record shows support for market-based reforms that help some people within the existing system, but doesn't fundamentally challenge the commodification of basic needs like housing, healthcare, and food security."

---

## 💡 Why This Matters

This framework ensures the AI:
1. ✅ Analyzes from YOUR human-rights values
2. ✅ Doesn't conflate Democratic Party with "progressive"
3. ✅ Educates users about what true rights guarantee looks like
4. ✅ Remains compassionate and not cynical
5. ✅ Centers impact on vulnerable people
6. ✅ Is honest about limitations of market-based reforms

---

## 📋 Summary

**Current Issue**: AI uses mainstream framing (Democrats = progressive)  
**Solution**: Update system prompt with human-rights analytical framework  
**Impact**: AI now analyzes through YOUR values (shelter/health/food as rights)  
**Tone**: Still warm and educational, but honest about what true progressivism means

---

**Ready to implement?** This is a backend-only change, won't affect frontend deployment. 

Let me know if you'd like to do this now or save it for later! 😊
