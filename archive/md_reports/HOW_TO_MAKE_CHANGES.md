# How to Make Changes to Your Website

## 🎯 Quick Answer

**Yes, I can absolutely help you make changes!** Here's how the process works:

---

## 📝 Making Changes: Simple Workflow

### Your Current Setup

```
Local Computer
  ↓ [edit files]
Save changes
  ↓ [upload via FTP]
Njalla Hosting → Live website updates
```

### For API Changes

```
Local Computer
  ↓ [edit API files]
Git commit & push
  ↓ [automatic]
Vercel → API updates automatically
```

---

## 🔄 Two Types of Changes

### Type 1: Frontend Changes (HTML/CSS/JS on Njalla)

**What this includes:**
- Text changes (wording, content)
- Styling changes (colors, fonts, layout)
- Adding new sections
- Fixing bugs
- Adding features
- Updating images

**How to make changes:**

#### Step 1: Edit Files Locally
```bash
# Open your project folder
cd /path/to/workforce-democracy-project

# Edit any file with your text editor
# Examples:
# - index.html (content, structure)
# - css/main.css (styling)
# - js/civic.js (functionality)
```

#### Step 2: Test Locally
```bash
# Open in browser
open index.html

# Or use a local server (optional)
python -m http.server 8000
# Then visit: http://localhost:8000
```

#### Step 3: Upload to Njalla
```bash
# Connect via FTP/SFTP
sftp username@your-njalla-host

# Upload changed files
put index.html
put css/main.css
put js/civic.js

# Or use FTP client (FileZilla, etc.)
```

#### Step 4: See Changes Live
```
Visit: https://your-domain.com
Changes appear immediately! ✅
```

---

### Type 2: API Changes (Serverless functions on Vercel)

**What this includes:**
- Adding new API endpoints
- Modifying API logic
- Changing API responses
- Adding new government data sources

**How to make changes:**

#### Step 1: Edit API Files Locally
```bash
# Navigate to API project
cd /path/to/workforce-api

# Edit API files
# Example: api/search-representatives.js
```

#### Step 2: Commit and Push
```bash
git add .
git commit -m "Description of changes"
git push
```

#### Step 3: Automatic Deployment
```
Vercel detects push → Builds → Deploys
Takes 30-60 seconds
Changes live automatically! ✅
```

---

## 💡 Common Changes You Might Want

### 1. Change Text/Content

**File:** `index.html`

**Example - Update hero section:**
```html
<!-- Find this section -->
<section id="hero" class="hero-section">
    <h1>Old Text Here</h1>
    <p>Old subtitle here</p>
</section>

<!-- Change to: -->
<section id="hero" class="hero-section">
    <h1>New Text Here</h1>
    <p>New subtitle here</p>
</section>
```

**Save → Upload to Njalla → Done!**

---

### 2. Change Colors/Styling

**File:** `css/main.css`

**Example - Change primary color:**
```css
/* Find this near the top */
:root {
    --primary: #FF6B35;  /* Old orange color */
}

/* Change to: */
:root {
    --primary: #2563eb;  /* New blue color */
}
```

**Save → Upload to Njalla → Entire site updates!**

---

### 3. Add New Section

**File:** `index.html`

**Example - Add "About Us" section:**
```html
<!-- Add this after an existing section -->
<section id="about" class="about-section section">
    <div class="container">
        <header class="section-header">
            <h2 class="section-title">
                <span class="icon">ℹ️</span>
                <span>About Us</span>
            </h2>
            <p class="section-subtitle">
                Learn more about the Workforce Democracy Project
            </p>
        </header>
        
        <div class="about-content">
            <p>Your content here...</p>
        </div>
    </div>
</section>
```

**Save → Upload to Njalla → New section appears!**

---

### 4. Add New Language

**File:** `js/language.js`

**Example - Add Italian:**
```javascript
// Find the translations object
const translations = {
    en: { /* English translations */ },
    es: { /* Spanish translations */ },
    fr: { /* French translations */ },
    de: { /* German translations */ },
    
    // Add Italian
    it: {
        site_title: 'Progetto Democrazia sul Lavoro',
        hero_title: 'Benvenuto',
        // ... add all translations
    }
};
```

**File:** `index.html`
```html
<!-- Add to language selector -->
<div class="language-menu" id="languageMenu">
    <button onclick="changeLanguage('en')">English</button>
    <button onclick="changeLanguage('es')">Español</button>
    <button onclick="changeLanguage('fr')">Français</button>
    <button onclick="changeLanguage('de')">Deutsch</button>
    <button onclick="changeLanguage('it')">Italiano</button> <!-- NEW -->
</div>
```

**Save → Upload both files → Italian available!**

---

### 5. Change Chat Widget Size Again

**File:** `css/main.css`

**Example - Make chat even smaller:**
```css
/* Find this section */
.chat-window {
    width: 320px;
    max-height: 400px;
}

/* Change to: */
.chat-window {
    width: 280px;  /* Smaller */
    max-height: 350px;  /* Shorter */
}
```

**Save → Upload to Njalla → Chat resizes!**

---

### 6. Add Another Country to Civic Module

**Files:** 
- `index.html` (add to dropdown)
- `api/search-representatives.js` (add API logic)

**index.html:**
```html
<select id="countrySelect">
    <option value="us">🇺🇸 United States</option>
    <option value="au">🇦🇺 Australia</option>
    <option value="gb">🇬🇧 Britain</option>
    <option value="uk">🇺🇦 Ukraine</option> <!-- NEW -->
</select>
```

**api/search-representatives.js:**
```javascript
if (country === 'uk') {
    // Add Ukraine API logic
    const response = await fetch('ukraine-parliament-api...');
    // Process and return data
}
```

**Save → Upload HTML to Njalla → Push API to Vercel → New country works!**

---

## 🛠️ Tools You'll Need

### For Frontend Changes (Njalla)

**Text Editor:**
- VS Code (recommended) - free, powerful
- Sublime Text
- Atom
- Any text editor

**FTP Client:**
- FileZilla (recommended) - free, easy
- Cyberduck (Mac)
- WinSCP (Windows)
- Command line SFTP

### For API Changes (Vercel)

**Git:**
- Install: git-scm.com
- Or use GitHub Desktop (GUI)

**Terminal/Command Line:**
- Mac: Terminal (built-in)
- Windows: Command Prompt or PowerShell
- Or use VS Code integrated terminal

---

## 📋 Step-by-Step: Making Your First Change

### Example: Change the Site Title

**What we'll change:** "Workforce Democracy Project EST 2025" → "Workforce Democracy Project EST 2024"

#### Step 1: Open File
```bash
# Navigate to your project
cd /path/to/workforce-democracy-project

# Open index.html in text editor
code index.html  # VS Code
# or
open -a "TextEdit" index.html  # Mac default
# or
notepad index.html  # Windows
```

#### Step 2: Find and Edit
```html
<!-- Find this (around line 79-82) -->
<div class="brand">
    <h1 class="site-title">
        <span class="icon">🏛️</span>
        <span class="title-text">Workforce Democracy Project</span>
    </h1>
    <p class="establishment">EST 2025</p>
</div>

<!-- Change to: -->
<div class="brand">
    <h1 class="site-title">
        <span class="icon">🏛️</span>
        <span class="title-text">Workforce Democracy Project</span>
    </h1>
    <p class="establishment">EST 2024</p> <!-- CHANGED -->
</div>
```

#### Step 3: Save File
```
File → Save (or Ctrl+S / Cmd+S)
```

#### Step 4: Test Locally
```bash
# Open in browser
open index.html
# Check that it says "EST 2024"
```

#### Step 5: Upload to Njalla

**Using FileZilla:**
1. Open FileZilla
2. Connect to Njalla:
   - Host: [your-njalla-ftp-host]
   - Username: [your-username]
   - Password: [your-password]
   - Port: 22 (SFTP)
3. Navigate to your site folder on right panel
4. Drag `index.html` from left panel to right panel
5. Confirm overwrite: Yes

**Using Command Line:**
```bash
sftp username@your-njalla-host
put index.html
quit
```

#### Step 6: Verify Live
```
1. Visit: https://your-domain.com
2. Refresh page (Ctrl+F5 or Cmd+Shift+R)
3. See "EST 2024" ✅
```

**Done!** You made your first change! 🎉

---

## 🤝 How I Can Help You

### I Can Help With:

✅ **Any changes you want to make:**
- Content updates (text, images)
- Styling changes (colors, fonts, layouts)
- New features (sections, pages, functionality)
- Bug fixes
- Optimization
- Accessibility improvements
- Mobile responsiveness tweaks

✅ **How the help process works:**

**You:** "I want to change [specific thing]"

**Me:** 
1. Show you exactly which file to edit
2. Give you the exact code changes
3. Explain what the code does
4. Tell you how to upload/deploy
5. Help troubleshoot if issues

### Examples of Help I Can Give:

**Request:** "I want to add a Donate button"
**I provide:**
- Exact HTML code for the button
- CSS styling to make it look good
- JavaScript for click handling
- Instructions on where to add it
- How to upload the changes

**Request:** "The mobile menu doesn't work on iPhone"
**I provide:**
- Diagnosis of the issue
- Fixed JavaScript code
- Testing steps
- Upload instructions

**Request:** "Add Canada to the Civic module"
**I provide:**
- HTML dropdown update
- API function code for Canada
- Step-by-step integration
- Testing checklist

---

## 📝 Change Request Template

**When you want to make changes, tell me:**

1. **What you want to change:**
   - "I want to add a new section about..."
   - "I want to change the color of..."
   - "I want to fix the bug where..."

2. **Where (if you know):**
   - "On the homepage"
   - "In the Civic Transparency section"
   - "In the mobile menu"

3. **What you want it to look/work like:**
   - "Like this website: [example]"
   - "Make it blue instead of orange"
   - "It should do [specific behavior]"

**I'll respond with:**
- ✅ Exact files to edit
- ✅ Exact code changes
- ✅ Step-by-step instructions
- ✅ Testing steps
- ✅ Upload/deployment guide

---

## 🔍 Quick Reference: What File to Edit

| Change Type | File to Edit |
|-------------|--------------|
| Text/Content | `index.html` |
| Structure/Layout | `index.html` |
| Colors/Fonts | `css/main.css` |
| Styling/Design | `css/main.css` |
| Functionality | `js/*.js` (specific module) |
| Civic Transparency | `js/civic.js` |
| Jobs Module | `js/jobs.js` |
| Chat Widgets | `js/civic.js` or `js/jobs.js` |
| Language | `js/language.js` |
| Security | `js/security.js` |
| API Endpoints | `api/*.js` (in Vercel project) |
| Navigation | `index.html` + `js/main.js` |
| Philosophies | `js/philosophies.js` |
| Local Resources | `js/local.js` |
| Learning Resources | `js/learning.js` |

---

## 🚨 Important Tips

### Before Making Changes

1. **Backup First:**
   ```bash
   # Make a backup copy
   cp index.html index.html.backup
   cp css/main.css css/main.css.backup
   ```

2. **Test Locally:**
   - Always test changes before uploading
   - Open files in browser
   - Check console for errors (F12)

3. **One Change at a Time:**
   - Make one change
   - Test it
   - Upload it
   - Verify it works
   - Then make next change

### After Making Changes

1. **Clear Browser Cache:**
   ```
   Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   ```

2. **Test on Mobile:**
   - Chrome DevTools (F12 → Toggle device toolbar)
   - Or test on actual phone

3. **Check Console:**
   - F12 → Console tab
   - Look for errors (red text)

---

## 📞 Getting Help from Me

### How to Ask for Help:

**Good request:**
```
"I want to change the background color of the hero section 
from orange to blue. Can you help?"
```

**I'll respond with:**
- Which file to edit (css/main.css)
- Exact line numbers
- Exact code to change
- Preview of what it will look like

**Another good request:**
```
"The chat widget close button stopped working after I made 
some changes to civic.js. Here's what I changed: [code]"
```

**I'll respond with:**
- Diagnosis of the issue
- Fixed code
- Explanation of what went wrong
- Instructions to fix it

### What Information Helps:

✅ **Helpful:**
- What you're trying to achieve
- What you already tried
- Any error messages
- Which file you edited
- Browser console errors (if any)

❌ **Less helpful:**
- "It's broken"
- "Nothing works"
- No details about what changed

---

## 🎯 Common Scenarios

### Scenario 1: "I want to update the about text"

**You ask:** "How do I change the text in the hero section?"

**I provide:**
```html
Open index.html, find this section (around line 120):

<section id="hero" class="hero-section">
    <p>Old text here</p>
</section>

Change to:
<section id="hero" class="hero-section">
    <p>Your new text here</p>
</section>

Save → Upload to Njalla → Done!
```

---

### Scenario 2: "I want a darker background"

**You ask:** "Can you make the background darker?"

**I provide:**
```css
Open css/main.css, find this (around line 25):

:root {
    --background: #FFFFFF;
}

Change to:
:root {
    --background: #1a1a1a;  /* Dark gray */
}

Save → Upload to Njalla → Entire site gets darker!
```

---

### Scenario 3: "Add a new country"

**You ask:** "I want to add Italy to the civic module"

**I provide:**

**Step 1 - Update HTML dropdown:**
```html
In index.html, find the country select (line ~170):

<select id="countrySelect">
    ...existing countries...
    <option value="it">🇮🇹 Italy</option> <!-- ADD THIS -->
</select>
```

**Step 2 - Add API logic:**
```javascript
In api/search-representatives.js, add:

if (country === 'it') {
    // Italy API logic here
    const response = await fetch('italy-parliament-api...');
    // ... code to process Italian data
}
```

**Step 3 - Deploy:**
```bash
# Upload HTML to Njalla
# Push API changes to Vercel:
git add .
git commit -m "Add Italy support"
git push
```

---

## 🔄 Version Control (Optional but Recommended)

### Why Use Git for Your Files?

**Benefits:**
- Track all changes over time
- Undo mistakes easily
- See what changed when
- Collaborate with others (future)

### Setup Git for Your Files

```bash
# In your project folder
cd /path/to/workforce-democracy-project

# Initialize Git (if not already)
git init

# Create .gitignore
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore

# Make initial commit
git add .
git commit -m "Initial project state"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/workforce-democracy.git
git push -u origin main
```

### Making Changes with Git

```bash
# Make your changes to files
# ...edit index.html, css/main.css, etc...

# Check what changed
git status
git diff

# Commit changes
git add .
git commit -m "Updated hero section text"
git push

# If you mess up, undo:
git checkout index.html  # Undo changes to one file
git reset --hard HEAD    # Undo all uncommitted changes
```

---

## ✅ Summary

### Making Changes is Easy:

1. **Edit files locally** (text editor)
2. **Test changes** (open in browser)
3. **Upload to Njalla** (FTP) or **Push to Vercel** (Git)
4. **Verify live** (visit your site)

### I'm Here to Help:

✅ Tell me what you want to change
✅ I'll give you exact code and instructions
✅ You can ask follow-up questions
✅ I'll help troubleshoot any issues

### You Have Full Control:

✅ All your files are on your computer
✅ You can edit anything, anytime
✅ Changes are immediate
✅ No complicated process
✅ I'll help whenever you need

---

## 🚀 Ready to Make Changes?

**Just tell me:**
- What you want to change
- Where (if you know)
- What you want it to look/do

**I'll provide:**
- Exact files to edit
- Exact code changes
- Step-by-step instructions
- Help until it works

**Let's make your website exactly how you want it!** 🎨✨

---

**Quick Start:** Tell me the first change you'd like to make and I'll walk you through it step-by-step!
