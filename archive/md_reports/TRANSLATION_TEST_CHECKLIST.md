# Translation Test Checklist

## How to Test Translations

### Step 1: Load the Page
Open index.html in your browser

### Step 2: Switch to Spanish (ES)
Click the language button (🌐 EN) and select "Español"

**Check these elements translate:**
- [ ] Hero welcome message
- [ ] "Want to see how your representatives vote?" → "¿Quieres ver cómo votan tus representantes?"
- [ ] "View Representatives" button → "Ver Representantes"
- [ ] "Curious how your opinions compare to officials?" → "¿Curioso cómo se comparan tus opiniones..."
- [ ] "Track & Compare Votes" button → "Rastrear y Comparar Votos"
- [ ] "Wondering what your job looks like..." → "¿Te preguntas cómo se ve tu trabajo..."
- [ ] "Explore Your Job" button → "Explorar Tu Trabajo"
- [ ] "Want to learn from real examples..." → "¿Quieres aprender de ejemplos reales..."
- [ ] "Start Learning" button → "Comenzar a Aprender"
- [ ] "Have questions about..." → "¿Tienes preguntas sobre..."
- [ ] "Read FAQ" button → "Leer FAQ"
- [ ] Civic headline: "See How Your Representatives Vote" → "Ve Cómo Votan Tus Representantes"
- [ ] FAQ navigation link: "💡 FAQ" → "💡 Preguntas Frecuentes"

### Step 3: Switch to French (FR)
Click language button and select "Français"

**Check these elements translate:**
- [ ] Hero welcome message in French
- [ ] All 5 feature card titles in French
- [ ] All 5 feature card descriptions in French
- [ ] All 5 feature card buttons in French
- [ ] Civic headline in French
- [ ] FAQ navigation in French

### Step 4: Switch to German (DE)
Click language button and select "Deutsch"

**Check these elements translate:**
- [ ] Hero welcome message in German
- [ ] All 5 feature card titles in German
- [ ] All 5 feature card descriptions in German
- [ ] All 5 feature card buttons in German
- [ ] Civic headline in German
- [ ] FAQ navigation in German

### Step 5: Switch Back to English (EN)
Click language button and select "English"

**Check everything returns to English:**
- [ ] All content back in English
- [ ] No leftover Spanish/French/German text
- [ ] Language button shows "EN"

## Quick Visual Test

### Elements That Should Change Language:

**Top Navigation:**
- Government Transparency
- Explore Jobs
- Learn
- FAQ ← **NEW**
- Local Resources
- Our Philosophies

**Hero Section:**
- Welcome message ← **NEW**
- 5 feature card titles ← **NEW**
- 5 feature card descriptions ← **NEW**
- 5 feature card buttons ← **NEW**

**Civic Section:**
- "Government Transparency" title
- "See How Your Representatives Vote" ← **NEW**
- Tagline below headline
- All filter controls

**Other Sections:**
- Jobs title and subtitle
- Learning title and subtitle
- FAQ title (when on that section)
- Local resources opt-in dialog
- Philosophy section title
- Footer content

## Common Issues to Check

### ❌ If Something Doesn't Translate:
1. Check browser console for errors
2. Verify element has `data-translate` attribute
3. Check translation key exists in language.js
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### ❌ If Only Some Elements Translate:
- Check if you're using the latest version (hard refresh)
- Check console for "Translation key not found" warnings

### ❌ If Nothing Translates:
- Check if JavaScript is enabled
- Check console for script errors
- Verify language.js loaded correctly

## Success Criteria

✅ **Test passes if:**
- All 4 languages work (EN, ES, FR, DE)
- All feature cards translate completely
- Civic headline translates
- Hero welcome message translates
- FAQ navigation link translates
- Language changes are instant (no delay)
- No mixed-language content
- Switching back to English restores all original text

## Translation Keys to Verify

### In js/language.js, check these keys exist:

**English (en):**
```
civic_headline
hero_welcome
nav_faq
feature_civic_title
feature_civic_desc
feature_civic_btn
feature_voting_title
feature_voting_desc
feature_voting_btn
feature_jobs_title
feature_jobs_desc
feature_jobs_btn
feature_learning_title
feature_learning_desc
feature_learning_btn
feature_faq_title
feature_faq_desc
feature_faq_btn
```

**Spanish (es), French (fr), German (de):**
- Same 18 keys for each language

## HTML Elements to Verify

### These should have `data-translate` attributes:

```html
<!-- Hero welcome -->
<p class="hero-subtitle" data-translate="hero_welcome">

<!-- Feature cards (5 cards) -->
<h3 class="feature-title" data-translate="feature_civic_title">
<p class="feature-description" data-translate="feature_civic_desc">
<span data-translate="feature_civic_btn">View Representatives</span>

<!-- Civic headline -->
<p class="civic-headline" data-translate="civic_headline">

<!-- FAQ navigation -->
<a href="#faq" data-translate="nav_faq">💡 FAQ</a>
```

## Browser Console Check

Open browser console (F12) and look for:

**✅ Good signs:**
```
📝 Initializing language selectors...
✅ Language selectors initialized
Language changed to Español
```

**❌ Bad signs:**
```
Translation key not found: feature_civic_title
Error: TRANSLATIONS is not defined
```

## Final Verification

After testing all languages, verify:
- [ ] 72 new translations work (18 keys × 4 languages)
- [ ] No English text remains when in Spanish/French/German
- [ ] Language selector shows correct language code (EN/ES/FR/DE)
- [ ] All modals and headers translate (not just homepage)
- [ ] Button text inside feature cards translates
- [ ] Navigation menu translates
- [ ] Footer translates

**Status:** If all checkboxes are ✅, translation system is 100% complete! 🎉
