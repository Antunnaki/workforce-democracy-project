# 📚 Documentation Index - Workforce Democracy Project

**Last Updated**: November 8, 2025  
**Current Version**: v37.6.0 (Option A - Simplified Citation System)  
**Status**: ✅ Citation system complete and working

---

## 🎯 Start Here (Pick Your Path)

### **Just Arrived? Start Here** ⬇️

**1. Quick Overview (5 minutes)**
- 📄 `START-HERE.md` - Current status, test results, what's next
- 🎯 `🎯-QUICK-REFERENCE-NOV-8-2025.md` - Quick reference guide

**2. Visual Understanding (10 minutes)**
- 📊 `📊-VISUAL-SUMMARY-NOV-8-2025.txt` - Visual journey from problem to solution
  - Shows v37.5.0 → v37.6.0 evolution
  - Diagrams of before/after architecture
  - Test results visualization

### **Need Full Context? Read This** ⬇️

**3. Complete Session Summary (30 minutes)**
- 📖 `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` - **COMPREHENSIVE 1,200+ LINE SUMMARY**
  - Primary request and intent
  - Key technical concepts
  - Files and code sections with line numbers
  - Problem solving journey (what worked, what didn't)
  - Pending tasks with implementation guides
  - Critical quotes from user
  - Next steps and recommendations

**4. Technical Handover Guide (45 minutes)**
- 🔧 `AI-HANDOVER-V37.6-COMPLETE.md` - Updated technical handover
  - Server access details (SSH, PM2 commands)
  - Direct file editing capabilities (sed, cat, heredoc)
  - Recent fixes (v37.5.0 → v37.6.0)
  - Project structure
  - Key files reference with line numbers
  - Common tasks (how to add frameworks, strengthen instructions, etc.)
  - Troubleshooting guide
  - Testing instructions

### **Want Everything? Read This** ⬇️

**5. Master Project Guide (2+ hours)**
- 📚 `PROJECT_MASTER_GUIDE.md` - 1,600+ line comprehensive documentation
  - Full API reference
  - All environment variables
  - RSS feed sources
  - Database schema
  - Complete architecture diagrams
  - Deployment procedures
  - Security considerations

---

## 📂 Document Categories

### **Session Handover Documents** (This Session - Nov 8, 2025)

| Document | Size | Purpose | Read Time |
|----------|------|---------|-----------|
| `START-HERE.md` | 7KB | Entry point, current status | 5 min |
| `🎯-QUICK-REFERENCE-NOV-8-2025.md` | 6KB | Quick reference guide | 5 min |
| `📊-VISUAL-SUMMARY-NOV-8-2025.txt` | 26KB | Visual journey diagrams | 10 min |
| `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` | 33KB | **Complete session summary** | 30 min |
| `AI-HANDOVER-V37.6-COMPLETE.md` | 17KB | Technical handover (updated) | 45 min |
| `📚-DOCUMENTATION-INDEX-NOV-8-2025.md` | This file | Documentation navigator | 5 min |

---

### **Previous Session Documents** (Historical Context)

**Citation Fix Journey** (Nov 6-7, 2025):
- `📖-HANDOVER-COMPLETE-SESSION-NOV-6-2025.md` - Previous session notes (26KB)
- `HANDOVER-SESSION-2025-11-06-CITATION-FIX.md` - Citation fix journey (22KB)
- `START-HERE-CITATION-FIX.md` - Previous start guide (9KB)

**Recent Deployment Documents** (Nov 1-7, 2025):
- `DEPLOY-COMMANDS.txt` - Quick deployment commands
- Multiple `DEPLOY-*.sh` and `*.md` files for various versions

---

### **Core Project Documentation**

**Master Guides**:
- `PROJECT_MASTER_GUIDE.md` - 60KB comprehensive guide (1,600+ lines)
- `README.md` - 52KB main project README

**Architecture & Design**:
- `BACKEND_ARCHITECTURE.md` - Backend system architecture
- `PERSONALIZATION_SYSTEM.md` - User personalization features
- `SECURITY-AUDIT-*.md` - Security considerations

**System Administration**:
- `DEPLOYMENT_*.md` - Various deployment guides
- `CORS-FIX-*.md` - CORS configuration guides
- `PM2-*.md` - Process manager documentation

---

## 🎯 Reading Paths by Role

### **For New AI Assistants** (Recommended Order):

1. **First 15 minutes**:
   - ✅ `START-HERE.md` - Get current status
   - ✅ `🎯-QUICK-REFERENCE-NOV-8-2025.md` - Learn the basics
   - ✅ Test the system - verify v37.6.0 is working

2. **Next 30 minutes**:
   - ✅ `📊-VISUAL-SUMMARY-NOV-8-2025.txt` - Understand the journey
   - ✅ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` - Get complete context

3. **Before Making Changes**:
   - ✅ `AI-HANDOVER-V37.6-COMPLETE.md` - Technical details
   - ✅ Read relevant sections of `PROJECT_MASTER_GUIDE.md`

4. **When Implementing**:
   - ✅ Check code locations in handover docs
   - ✅ Always backup: `cp ai-service.js ai-service-BACKUP-$(date +%Y%m%d).js`
   - ✅ Always restart PM2: `pm2 restart backend`

---

### **For Users** (Quick Reference):

1. **What's Working**:
   - ✅ `START-HERE.md` - Current system status

2. **What Changed**:
   - ✅ `📊-VISUAL-SUMMARY-NOV-8-2025.txt` - Visual before/after

3. **What's Next**:
   - ✅ `START-HERE.md` - Section: "What's Next (User to Prioritize)"
   - ✅ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` - Section 5: Pending Tasks

---

### **For Developers** (Technical Deep Dive):

1. **Current Implementation**:
   - ✅ `AI-HANDOVER-V37.6-COMPLETE.md` - Technical details
   - ✅ `PROJECT_MASTER_GUIDE.md` - Full architecture

2. **Code Changes**:
   - ✅ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` - Section 3: Files and Code Sections
   - ✅ Direct file access: `ssh root@185.193.126.13`

3. **Implementation Guides**:
   - ✅ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` - Section 5: Pending Tasks
     - Complete code examples for analytical frameworks
     - Source relevance improvement strategies
     - Generic phrase removal implementation

---

## 📋 Key Information Quick Access

### **Current System Status (v37.6.0)**

**Citation System**: ✅ Option A - Natural source names  
**Pre-Search**: ✅ Working - Finds sources before LLM call  
**Source Matching**: ✅ Perfect - No mismatch errors  
**Stability**: ✅ Excellent  

**Expected Behavior**:
- AI cites by source name: "According to Truthout..."
- No numbered citations [1], [2], [3] in text
- Sources appear in collapsible menu
- Frontend logs show: `Citations: 0, Sources: 2-3`

---

### **Server Access**

**SSH**: `ssh root@185.193.126.13`  
**Backend Path**: `/var/www/workforce-democracy/backend/`  
**Key File**: `ai-service.js` (v37.6.0)  

**PM2 Commands**:
```bash
pm2 list                     # Status
pm2 logs backend --lines 50  # View logs
pm2 restart backend          # Restart
pm2 monit                    # Monitor
```

---

### **Code Locations (v37.6.0)**

**backend/ai-service.js**:
- Lines 320-361: Policy keyword triggers in `needsCurrentInfo()`
- Lines 1020-1060: Phase 1 pre-search
- Lines 1146-1165: Option A implementation (natural citations)

**File Sizes** (for reference):
- `ai-service.js`: ~1,500 lines
- `server.js`: ~400 lines
- `rss-service.js`: ~800 lines

---

### **Testing Checklist**

**Quick Test** (2 minutes):
```bash
# 1. Check PM2 status
ssh root@185.193.126.13 'pm2 list'

# 2. Watch logs
ssh root@185.193.126.13 'pm2 logs backend --lines 0'

# 3. Open chat and test
# Visit: https://workforcedemocracy.org
# Ask: "What happens if SNAP benefits are cut?"
# Verify: Natural citations, sources in menu, no errors
```

**Expected Logs**:
```
🔍 Pre-searching sources before LLM call...
📚 Found 2 sources to provide to LLM
✅ Providing 2 validated sources to LLM
```

---

## 🚨 Critical Warnings for AI Assistants

### **DO NOT**:
❌ Try to "fix" citation system back to numbered [1], [2], [3]  
❌ Make changes without reading session summary  
❌ Assume next priority without asking user  
❌ Skip backups before making changes  
❌ Forget to restart PM2 after backend edits  

### **DO**:
✅ Read complete session summary first  
✅ Test current system before changes  
✅ Ask user to prioritize next feature  
✅ Always backup: `cp ai-service.js ai-service-BACKUP-$(date +%Y%m%d).js`  
✅ Always restart: `pm2 restart backend`  

---

## 📊 Pending Features (User to Prioritize)

**Not Yet Implemented** - Ask user which to work on next:

1. **Source Relevance Improvements** (Medium complexity, High impact)
2. **Analytical Frameworks** (Medium-High complexity, Very High impact)
3. **Generic Phrase Removal** (Low complexity, Medium impact)

**Implementation Guides**: See `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 5

---

## 🔍 Finding Specific Information

### **How to...**

**Understand what changed this session?**
→ `📊-VISUAL-SUMMARY-NOV-8-2025.txt` - Visual journey

**Get code implementation details?**
→ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 3 - Files and Code Sections

**Learn how to add analytical frameworks?**
→ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 5.1 - Complete code examples

**Troubleshoot PM2 issues?**
→ `AI-HANDOVER-V37.6-COMPLETE.md` Section: Troubleshooting

**Edit backend files directly?**
→ `AI-HANDOVER-V37.6-COMPLETE.md` Section: Server Access & Direct File Editing

**Understand user's priorities?**
→ `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 8 - Critical Quotes

---

## 📈 Version History

- **v37.5.0** (Nov 7): Phase 1 pre-search, policy keywords
- **v37.6.0** (Nov 8): Option A - Simplified citation system ⬅️ **CURRENT**
- **v37.6.x** (Future): Pending user prioritization

---

## ✨ Success Metrics (v37.6.0) - ALL MET ✅

**Citation System**:
- ✅ Natural source citations working
- ✅ No numbered citations
- ✅ Sources in menu
- ✅ No mismatch errors
- ✅ System stable

**User Satisfaction**:
- ✅ User chose this approach for stability
- ✅ User confirmed it's working
- ✅ Ready for quality improvements

---

## 💡 Pro Tips

### **For Efficient Onboarding**:
1. Start with `START-HERE.md` (5 min)
2. Read visual summary (10 min)
3. Read complete session summary (30 min)
4. Test the system yourself (5 min)
5. Ask user about next priority

**Total Time**: ~50 minutes to full context

### **For Quick Debugging**:
```bash
# Check if v37.6.0 is loaded
ssh root@185.193.126.13 'pm2 logs backend | grep "Option A"'

# Check pre-search is working
ssh root@185.193.126.13 'pm2 logs backend | grep "Pre-searching"'

# Check source count
ssh root@185.193.126.13 'pm2 logs backend | grep "Providing"'
```

### **For Making Changes**:
1. **Always** read relevant handover section first
2. **Always** backup: `cp file file-BACKUP-$(date +%Y%m%d).js`
3. **Always** test syntax: `node -c ai-service.js`
4. **Always** restart PM2: `pm2 restart backend`
5. **Always** verify logs: `pm2 logs backend --lines 50`

---

## 📞 Need Help?

**Can't find something?**
- Check this index (you're reading it!)
- Search in `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md`
- Grep the codebase: `ssh root@185.193.126.13 'cd /var/www/workforce-democracy && grep -r "search term" .'`

**System not working as expected?**
- Check `AI-HANDOVER-V37.6-COMPLETE.md` - Troubleshooting section
- Review recent PM2 logs: `pm2 logs backend --lines 200`
- Verify v37.6.0 is loaded: Check for "Option A" in logs

**Want to implement a feature?**
- Check implementation guide in `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 5
- Review similar past implementations in `PROJECT_MASTER_GUIDE.md`
- Ask user to prioritize first!

---

**Happy Reading! 📚 The documentation is comprehensive - you've got this! 🚀**
