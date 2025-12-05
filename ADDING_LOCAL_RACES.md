# 📝 How to Add New Local Races

## **Simple Guide for Non-Technical Users**

This guide shows you how to add coverage for new local elections (mayor, city council, etc.) so your users can get information about candidates.

---

## 🎯 **Two Ways to Add Coverage**

### **Method 1: Quick Manual Addition** (5 minutes)
Add hand-picked links for specific candidates

### **Method 2: Add New Region** (10 minutes)
Add local news sources for a new city/region

---

## 📌 **Method 1: Add a Specific Candidate/Race**

### **When to Use This**:
- You know about an important local race
- You want immediate coverage
- You have good Ballotpedia/Wikipedia links

### **Step-by-Step**:

#### **1. SSH to Server**
```bash
ssh root@185.193.126.13
```

#### **2. Navigate to Backend**
```bash
cd /var/www/workforce-democracy/backend
```

#### **3. Backup File**
```bash
cp ai-service.js ai-service.js.backup
```

#### **4. Edit File**
```bash
nano ai-service.js
```

#### **5. Find the Curated Sources Section**

Press `Ctrl+W` (search), type: `getKnownLocalRaceSources`

You'll see code like this:

```javascript
function getKnownLocalRaceSources(query) {
    const sources = [];
    const lowerQuery = query.toLowerCase();
    
    // Albany Mayor 2025 - Dorcey Applyrs
    if (lowerQuery.includes('dorcey') || 
        lowerQuery.includes('applyrs') || 
        (lowerQuery.includes('albany') && lowerQuery.includes('mayor'))) {
        
        sources.push({
            title: 'Dorcey Applyrs - Ballotpedia',
            url: 'https://ballotpedia.org/Dorcey_Applyrs',
            source: 'Ballotpedia',
            type: 'candidate_profile',
            excerpt: 'Dorcey Applyrs is the mayor-elect of Albany...',
            date: new Date().toISOString()
        });
        
        // ... more sources
    }
    
    // Add more known races here
    
    return sources;
}
```

#### **6. Add Your New Race**

**Before the `return sources;` line**, add:

```javascript
    // Buffalo Mayor 2025 - Byron Brown (EXAMPLE)
    if (lowerQuery.includes('byron') || 
        lowerQuery.includes('brown') || 
        (lowerQuery.includes('buffalo') && lowerQuery.includes('mayor'))) {
        
        sources.push({
            title: 'Byron Brown - Ballotpedia',
            url: 'https://ballotpedia.org/Byron_Brown',
            source: 'Ballotpedia',
            type: 'candidate_profile',
            excerpt: 'Byron Brown is running for Buffalo mayor...',
            date: new Date().toISOString()
        });
        
        sources.push({
            title: 'Buffalo mayoral election, 2025 - Ballotpedia',
            url: 'https://ballotpedia.org/Buffalo,_New_York_mayoral_election,_2025',
            source: 'Ballotpedia',
            type: 'election',
            excerpt: 'Complete coverage of Buffalo mayoral race...',
            date: new Date().toISOString()
        });
    }
```

**Customize This**:
- Replace `'byron'`, `'brown'`, `'buffalo'` with your candidate/city
- Replace URLs with actual Ballotpedia links
- Update title and excerpt text

#### **7. Save and Exit**
- Press `Ctrl+O` (save)
- Press `Enter` (confirm)
- Press `Ctrl+X` (exit)

#### **8. Restart Backend**
```bash
pm2 restart backend
```

#### **9. Test It**
```bash
pm2 logs backend --lines 0
```

Then ask in the chat: "Tell me about [Your Candidate]"

You should see:
```
📌 Found 2 curated sources for local race
```

---

## 🗺️ **Method 2: Add a New Region's News Sources**

### **When to Use This**:
- You want coverage for a whole new city/region
- You want to add local news sources
- You want automatic searching

### **Step-by-Step**:

#### **1-4: Same as Method 1** (SSH, navigate, backup, edit)

#### **5. Find Local News Configuration**

Press `Ctrl+W`, type: `LOCAL_NEWS_SOURCES`

You'll see:

```javascript
const LOCAL_NEWS_SOURCES = {
    'new_york': [
        {
            name: 'The City NYC',
            url: 'https://www.thecity.nyc',
            searchPath: '/?s=',
            type: 'local_independent',
            coverage: ['NYC', 'New York City']
        },
        // ... more sources
    ],
    'default': [
        // ...
    ]
};
```

#### **6. Add New Region**

**After the `'new_york'` section**, before `'default'`, add:

```javascript
    'pennsylvania': [
        {
            name: 'Philadelphia Inquirer',
            url: 'https://www.inquirer.com',
            searchPath: '/search?q=',
            type: 'local_news',
            coverage: ['Philadelphia', 'Philly']
        },
        {
            name: 'Pittsburgh Post-Gazette',
            url: 'https://www.post-gazette.com',
            searchPath: '/search/?q=',
            type: 'local_news',
            coverage: ['Pittsburgh']
        }
    ],
```

**Key Parts to Customize**:
- `'pennsylvania'`: Region name (lowercase, no spaces)
- `name`: Display name of news source
- `url`: Base URL of the site
- `searchPath`: How their search works (check manually)
- `coverage`: Cities/regions this source covers

#### **7. Find Search Path**

To find the `searchPath` for a news site:

1. Go to the news site
2. Use their search feature
3. Search for "test"
4. Look at the URL

Examples:
- `https://site.com/?s=test` → searchPath: `'/?s='`
- `https://site.com/search?q=test` → searchPath: `'/search?q='`
- `https://site.com/search/?query=test` → searchPath: `'/search/?query='`

#### **8. Save, Exit, Restart** (Same as Method 1)

#### **9. Test It**

Ask: "What's happening in the Philadelphia mayoral race?"

Logs should show:
```
📰 Searching 2 local news sources for: "Philadelphia mayoral race"
  ✅ Philadelphia Inquirer: Found article - ...
```

---

## 📚 **Common Patterns**

### **Pattern: NYC Council Race**

```javascript
// NYC Council District 7 - Shahana Hanif
if ((lowerQuery.includes('shahana') || lowerQuery.includes('hanif')) ||
    (lowerQuery.includes('council') && lowerQuery.includes('district 7'))) {
    
    sources.push({
        title: 'Shahana Hanif - Ballotpedia',
        url: 'https://ballotpedia.org/Shahana_Hanif',
        source: 'Ballotpedia',
        type: 'candidate_profile',
        excerpt: 'NYC Council Member representing District 7...',
        date: new Date().toISOString()
    });
}
```

### **Pattern: County Executive**

```javascript
// Nassau County Executive - Bruce Blakeman
if ((lowerQuery.includes('bruce') || lowerQuery.includes('blakeman')) ||
    (lowerQuery.includes('nassau') && lowerQuery.includes('county executive'))) {
    
    sources.push({
        title: 'Nassau County Executive election',
        url: 'https://ballotpedia.org/Nassau_County,_New_York_County_Executive_election',
        source: 'Ballotpedia',
        type: 'election',
        excerpt: 'Nassau County Executive race information...',
        date: new Date().toISOString()
    });
}
```

### **Pattern: State Senator**

```javascript
// NY State Senate District 18 - Julia Salazar
if ((lowerQuery.includes('julia') || lowerQuery.includes('salazar')) ||
    (lowerQuery.includes('state senate') && lowerQuery.includes('district 18'))) {
    
    sources.push({
        title: 'Julia Salazar - Ballotpedia',
        url: 'https://ballotpedia.org/Julia_Salazar',
        source: 'Ballotpedia',
        type: 'candidate_profile',
        excerpt: 'NY State Senator representing District 18...',
        date: new Date().toISOString()
    });
}
```

---

## 🔍 **Finding Ballotpedia URLs**

### **Method 1: Direct URL**

Ballotpedia URLs follow a pattern:
- Candidate: `https://ballotpedia.org/[First_Name_Last_Name]`
- Election: `https://ballotpedia.org/[City],_[State]_[position]_election,_[year]`

Examples:
- `https://ballotpedia.org/Eric_Adams`
- `https://ballotpedia.org/New_York_City,_New_York_mayoral_election,_2025`

**Test the URL** in a browser before adding it!

### **Method 2: Search Ballotpedia**

1. Go to https://ballotpedia.org
2. Search for the candidate
3. Copy the URL from browser address bar

---

## ⚠️ **Important Notes**

### **Keywords Must Match User Queries**

The `lowerQuery.includes('keyword')` checks what users might type.

**Good keyword choices**:
- Candidate names (first and last)
- City names
- Position names (mayor, council, etc.)

**Bad keyword choices**:
- Too specific: `'democratic candidate for mayor'`
- Too generic: `'election'`

### **Testing Keywords**

After adding a race, test with different queries:
- ✅ "Tell me about [Candidate Name]"
- ✅ "[City] mayor race"
- ✅ "Who is running for [Position] in [City]?"

### **Duplicate Detection**

The `||` (OR) operator means "match any of these":
```javascript
if (lowerQuery.includes('dorcey') ||   // Matches "dorcey"
    lowerQuery.includes('applyrs') ||  // OR "applyrs"
    (lowerQuery.includes('albany') && lowerQuery.includes('mayor'))) {  // OR both "albany" AND "mayor"
```

---

## 📊 **Maintenance Schedule**

### **After Each Election**:
1. Update election URLs to reflect results
2. Change "running for" to "elected" in excerpts
3. Keep for historical reference

### **Monthly**:
1. Check for upcoming local races
2. Add new candidates as they announce
3. Test that Ballotpedia URLs still work

### **Annually**:
1. Review all curated sources
2. Remove outdated races
3. Add new election cycles

---

## 🆘 **Troubleshooting**

### **"Syntax Error" When Restarting**

**Problem**: You made a typo in the code

**Fix**:
```bash
# Restore backup
cp ai-service.js.backup ai-service.js
pm2 restart backend
```

Then try editing again, being careful with:
- Commas at end of each `sources.push({...}),`
- Quotes matching (single or double)
- Parentheses and braces closing properly

### **"No Sources Found"**

**Problem**: Keywords don't match user query

**Fix**: Add more keyword variations:
```javascript
if (lowerQuery.includes('dorcey') || 
    lowerQuery.includes('applyrs') ||
    lowerQuery.includes('dorsey') ||  // Common misspelling
    lowerQuery.includes('applyers') || // Another misspelling
    (lowerQuery.includes('albany') && lowerQuery.includes('mayor'))) {
```

### **"Ballotpedia Link Not Working"**

**Problem**: URL has typo or page doesn't exist

**Fix**:
1. Test URL in browser
2. Search Ballotpedia directly
3. Use correct URL with underscores: `First_Name_Last_Name`

---

## ✅ **Quick Reference**

### **Add a Candidate (Copy-Paste Template)**:

```javascript
    // [City] [Position] [Year] - [Candidate Name]
    if (lowerQuery.includes('[first_name]') || 
        lowerQuery.includes('[last_name]') || 
        (lowerQuery.includes('[city]') && lowerQuery.includes('[position]'))) {
        
        sources.push({
            title: '[Candidate Name] - Ballotpedia',
            url: 'https://ballotpedia.org/[First_Name_Last_Name]',
            source: 'Ballotpedia',
            type: 'candidate_profile',
            excerpt: '[Brief description of candidate]...',
            date: new Date().toISOString()
        });
    }
```

**Replace**:
- `[City]`, `[Position]`, `[Year]`: Race details
- `[first_name]`, `[last_name]`: Lowercase names
- `[Candidate Name]`: Display name
- `[First_Name_Last_Name]`: URL format (underscores)
- `[Brief description]`: Short summary

---

**Need help?** Check DEPLOYMENT_v37.2.0.md for detailed technical documentation.
