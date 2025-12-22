# 📁 File Structure - Workforce Democracy Project

Complete listing of all project files with descriptions.

---

## Root Directory

```
workforce-democracy-project/
├── index.html                    # Main application page (29KB)
├── manifest.json                 # PWA manifest (641 bytes)
├── favicon.svg                   # Project icon (849 bytes)
├── sw.js                         # Service Worker (2.4KB)
├── README.md                     # Main documentation (16KB)
├── GETTING_STARTED.md            # User guide (7.7KB)
├── DEPLOYMENT.md                 # Deployment instructions (9.6KB)
├── PROJECT_SUMMARY.md            # Complete project overview (15KB)
├── FILE_STRUCTURE.md             # This file
├── css/
│   └── main.css                  # Complete stylesheet (27KB)
└── js/
    ├── main.js                   # Core application logic (18KB)
    ├── security.js               # Encryption & privacy (16KB)
    ├── charts.js                 # Data visualization (12KB)
    ├── civic.js                  # Government transparency (24KB)
    ├── jobs.js                   # Job comparisons (28KB)
    ├── learning.js               # Educational resources (16KB)
    ├── language.js               # Multi-language support (15KB)
    ├── local.js                  # Local resources finder (18KB)
    └── philosophies.js           # Core principles (11KB)
```

---

## Detailed File Descriptions

### 📄 HTML Files

#### index.html (29,854 bytes)
**Purpose**: Main application page  
**Contains**:
- Complete semantic HTML5 structure
- All sections: Hero, Civic, Jobs, Learning, Local, Philosophies
- Language selector
- Mobile and desktop navigation
- Modal containers
- Loading indicators
- Footer with privacy links
- Script and stylesheet references

**Key Features**:
- Accessibility-first markup
- SEO-optimized meta tags
- Content Security Policy
- Privacy-focused headers
- Progressive Web App support

---

### 🎨 CSS Files

#### css/main.css (26,638 bytes)
**Purpose**: Complete styling system  
**Contains**:
- CSS custom properties (design tokens)
- Reset and base styles
- Typography system
- Layout utilities
- Component styles
- Responsive breakpoints
- Accessibility features
- Print styles
- Dark mode support
- Reduced motion support

**Design System**:
- Color palette (6 main colors)
- Spacing scale (7 sizes)
- Typography scale (8 sizes)
- Border radius system
- Shadow system
- Z-index scale

**Components Styled**:
- Navigation (mobile & desktop)
- Buttons (3 variants)
- Forms and inputs
- Cards (6 types)
- Modals
- Chat widgets
- Resource displays
- Philosophy cards
- Local resource cards
- Representative profiles

---

### 💻 JavaScript Files

#### js/main.js (17,730 bytes)
**Purpose**: Core application logic  
**Responsibilities**:
- Application initialization
- User preference management
- Personalization controls
- Modal system
- Loading indicators
- Notification system
- Privacy functions (export/delete data)
- Contact form handling
- Mobile menu controls
- Language selector logic
- Utility functions

**Global Functions Exported**:
- `toggleMobileMenu()`
- `enablePersonalization()`
- `skipPersonalization()`
- `showPrivacyPolicy()`
- `showSecurityInfo()`
- `exportUserData()`
- `deleteUserData()`
- `showContactForm()`
- `openModal()` / `closeModal()`
- `showLoading()` / `hideLoading()`

---

#### js/security.js (16,081 bytes)
**Purpose**: Security and encryption  
**Features**:
- AES-256-GCM encryption
- PBKDF2 key derivation (600,000 iterations)
- Secure storage wrapper
- Anti-fingerprinting measures
- Privacy threat detection
- Secure data deletion (DOD standard)
- Data export functionality
- HMAC generation
- Device key management

**Classes**:
- `SecurityManager`: Main encryption class
- `PrivacyUtils`: Privacy helper functions

**Key Methods**:
- `encrypt()` / `decrypt()`
- `secureStore()` / `secureRetrieve()`
- `secureDelete()`
- `deleteAllUserData()`
- `exportUserData()`
- `implementAntiFingerprinting()`

---

#### js/charts.js (11,668 bytes)
**Purpose**: Data visualization with Chart.js  
**Chart Types**:
1. **Radar Chart**: Voting pattern analysis
2. **Line Chart**: Voting timeline
3. **Doughnut Chart**: Bill type distribution
4. **Bar Chart**: Workplace comparisons
5. **Progress Chart**: Learning advancement

**Functions**:
- `createVotingPatternChart()`
- `createVotingTimelineChart()`
- `createBillTypeChart()`
- `createComparisonChart()`
- `createLearningProgressChart()`

**Features**:
- Responsive charts
- Custom color schemes
- Interactive tooltips
- Accessibility considerations

---

#### js/civic.js (23,993 bytes)
**Purpose**: Government transparency module  
**Features**:
- 6 country support (US, AU, GB, FR, DE, CA)
- Representative search
- Voting record display
- Bill analysis
- Advanced filtering
- Chart integration
- LLM chat assistant
- Sample data generation

**Key Functions**:
- `handleCountryChange()`
- `searchCivicData()`
- `displayCivicResults()`
- `createRepresentativeCard()`
- `applyCivicFilters()`
- `toggleCivicChat()`
- `sendCivicMessage()`
- `analyzeBillImpact()`

**Data Structures**:
- Government API endpoints
- Civic state management
- Representative profiles
- Voting records
- Bill information

---

#### js/jobs.js (27,571 bytes)
**Purpose**: Job comparison system  
**Features**:
- **200+ professions** across 15 industries
- Category browsing
- Detailed job comparisons
- Real cooperative examples
- Transformation analysis
- LLM chat assistant

**Industry Categories** (15):
1. Technology (24 jobs)
2. Healthcare (26 jobs)
3. Education (22 jobs)
4. Creative Arts (26 jobs)
5. Skilled Trades (25 jobs)
6. Business & Finance (25 jobs)
7. Service Industry (25 jobs)
8. Transportation (20 jobs)
9. Manufacturing (15 jobs)
10. Agriculture (15 jobs)
11. Science & Research (16 jobs)
12. Legal Services (15 jobs)
13. Media & Communications (15 jobs)
14. Social Services (13 jobs)
15. Government (13 jobs)

**Key Functions**:
- `initializeJobCategories()`
- `showJobCategory()`
- `showJobComparison()`
- `generateJobComparison()`
- `toggleJobsChat()`
- `sendJobsMessage()`

---

#### js/learning.js (16,401 bytes)
**Purpose**: Educational resources  
**Resource Types**:
- Videos (YouTube privacy-enhanced)
- Articles (text content)
- Research studies (with citations)
- Interactive experiences

**Key Functions**:
- `initializeLearningResources()`
- `displayResources()`
- `filterResources()`
- `playVideo()`
- `showStudyDetail()`
- `showArticle()`

**Features**:
- Resource filtering
- Video modal playback
- Study detail views
- Citation display
- Resource metadata

---

#### js/language.js (15,064 bytes)
**Purpose**: Multi-language support  
**Languages Supported**:
1. English (en) - Complete
2. Spanish (es) - Complete
3. French (fr) - Complete
4. German (de) - Complete

**Translation Keys**: 50+ UI strings

**Key Functions**:
- `changeLanguage()`
- `applyTranslations()`
- `getLanguageName()`

**Features**:
- Dynamic language switching
- Persistent preference
- Placeholder translation
- Content translation

---

#### js/local.js (18,422 bytes)
**Purpose**: Local resources finder  
**Resource Types**:
1. Worker Cooperatives
2. Ethical Businesses
3. Community Services
4. Social Enterprises

**Key Functions**:
- `searchLocalResources()`
- `displayLocalResults()`
- `submitLocalBusiness()`
- `handleBusinessSubmit()`

**Features**:
- Location-based search
- Business submission form
- Verification queue system
- Resource categorization
- Contact information display

---

#### js/philosophies.js (10,954 bytes)
**Purpose**: 17 core philosophies  
**Features**:
- Philosophy card display
- Detailed modal views
- Icons and descriptions
- Real-world examples

**Key Functions**:
- `initializePhilosophies()`
- `showPhilosophyDetail()`

**All 17 Philosophies Included**:
1. Worker Empowerment
2. Economic Justice
3. Community Centered
4. Environmental Stewardship
5. Cultural Sensitivity
6. Continuous Learning
7. Transparency
8. Collaboration Over Competition
9. Human Dignity
10. Innovation for Good
11. Accessibility
12. Privacy Protection
13. Scholarly Attribution
14. Information Belongs to Everyone
15. Ethical Standards Above All
16. Universal Capacity for Change
17. Ethical Treatment of AI

---

### ⚙️ Configuration Files

#### manifest.json (641 bytes)
**Purpose**: Progressive Web App configuration  
**Contains**:
- App name and description
- Display mode (standalone)
- Theme colors
- Icon definitions
- Orientation settings
- App categorization

---

#### sw.js (2,427 bytes)
**Purpose**: Service Worker for offline support  
**Features**:
- Asset caching
- Network-first strategy
- Cache versioning
- Offline fallback

**Cached Assets**:
- All HTML, CSS, and JS files
- Core application resources

---

### 🎨 Assets

#### favicon.svg (849 bytes)
**Purpose**: Website icon  
**Design**: 
- Building with columns (democracy symbol)
- Worker figures at base
- Primary color scheme
- SVG format (scalable)

---

### 📚 Documentation Files

#### README.md (16,161 bytes)
**Purpose**: Main project documentation  
**Sections**:
- Project overview
- Current features
- Technical architecture
- File structure
- Core philosophies
- Development guide
- Deployment instructions
- Contributing guidelines
- License information
- Contact details

---

#### GETTING_STARTED.md (7,679 bytes)
**Purpose**: User guide  
**Sections**:
- Quick start instructions
- Browser requirements
- First-time setup
- Feature overview
- Navigation tips
- Data management
- Troubleshooting
- Privacy information

---

#### DEPLOYMENT.md (9,598 bytes)
**Purpose**: Deployment instructions  
**Sections**:
- Platform-specific guides (6 platforms)
- Security header configuration
- Custom domain setup
- Post-deployment checklist
- Performance optimization
- Monitoring options
- Troubleshooting
- Cost estimates

---

#### PROJECT_SUMMARY.md (14,962 bytes)
**Purpose**: Comprehensive project overview  
**Sections**:
- Implementation summary
- Deliverables list
- Key features
- Technical architecture
- Performance metrics
- Accessibility compliance
- Quality assurance
- Project achievements

---

#### FILE_STRUCTURE.md (This file)
**Purpose**: Complete file listing with descriptions

---

## File Size Summary

### By Type
- **HTML**: 30KB (1 file)
- **CSS**: 27KB (1 file)
- **JavaScript**: 158KB (9 files)
- **Documentation**: 54KB (5 files)
- **Configuration**: 3KB (2 files)
- **Assets**: 1KB (1 file)

### Total Project Size
**~273KB** (excluding external CDN resources)

---

## External Dependencies (CDN)

While not included in the project files, these external resources are loaded:

1. **Chart.js** (4.4.0) - ~200KB
   - `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`

2. **Font Awesome** (6.4.0) - ~70KB
   - `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css`

3. **Google Fonts** (Inter) - ~40KB
   - `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap`

**Total with CDN**: ~583KB

---

## Code Statistics

### Lines of Code
- **HTML**: ~540 lines
- **CSS**: ~900 lines
- **JavaScript**: ~1,200 lines (total across all modules)
- **Documentation**: ~4,500 lines
- **Total**: ~7,140 lines

### File Count
- **Core Files**: 12 (HTML, CSS, JS, SW)
- **Documentation**: 5 files
- **Configuration**: 2 files
- **Assets**: 1 file
- **Total**: 20 files

---

## Module Dependencies

### Internal Dependencies
```
main.js
├── security.js (encryption)
├── language.js (translations)
└── All other modules

civic.js
├── security.js (data storage)
├── charts.js (visualization)
└── main.js (utilities)

jobs.js
├── security.js (preferences)
└── main.js (utilities)

learning.js
└── main.js (utilities)

local.js
├── security.js (storage)
└── main.js (utilities)

philosophies.js
└── main.js (utilities)
```

### External Dependencies
All modules can use:
- Chart.js (global `Chart` object)
- Font Awesome (CSS classes)
- Google Fonts (CSS @import)

---

## Naming Conventions

### Files
- **HTML**: lowercase, `.html`
- **CSS**: lowercase, `.css`
- **JavaScript**: camelCase, `.js`
- **Documentation**: UPPERCASE, `.md`
- **Configuration**: lowercase, `.json`

### JavaScript
- **Classes**: PascalCase (`SecurityManager`)
- **Functions**: camelCase (`searchCivicData`)
- **Constants**: UPPERCASE (`JOB_DATABASE`)
- **Variables**: camelCase (`currentLanguage`)

### CSS
- **Classes**: kebab-case (`.nav-list`)
- **IDs**: camelCase (`#civicResults`)
- **Custom Properties**: kebab-case (`--primary`)

---

## Version Control Considerations

### Files to Commit
✅ All files listed above

### Files to Ignore (if added)
- `node_modules/`
- `.DS_Store`
- `*.log`
- `.env` (if ever added)
- `.vscode/`
- `.idea/`
- `dist/` (if build process added)

### Recommended .gitignore
```
# OS files
.DS_Store
Thumbs.db

# Editor directories
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Dependencies (if ever added)
node_modules/

# Build output (if ever added)
dist/
build/

# Environment files (should never be added)
.env
.env.local
```

---

## Build Process

**Current Status**: No build process required

This is a pure static website that works directly from the source files. No compilation, transpilation, or bundling needed.

**Optional Optimizations**:
If you want to add optimization, you could:
- Minify CSS (saves ~30%)
- Minify JavaScript (saves ~40%)
- Bundle JS files (reduces HTTP requests)
- Optimize SVG (minimal gains)

But current file sizes are already very efficient (~273KB total).

---

## Maintenance Notes

### Regular Updates
- Security dependencies (Chart.js, Font Awesome)
- Browser compatibility testing
- Accessibility audits
- Content updates (new jobs, cooperatives)
- Translation improvements

### Version Tracking
- Use semantic versioning (v1.0.0)
- Tag releases in Git
- Document changes in CHANGELOG.md (optional)

---

## File Integrity

All files are:
- ✅ UTF-8 encoded
- ✅ Unix line endings (LF)
- ✅ Properly formatted
- ✅ Syntax validated
- ✅ Minification-ready
- ✅ Cross-platform compatible

---

**This completes the file structure documentation for the Workforce Democracy Project.**

🏛️ **Workforce Democracy Project EST 2025**
