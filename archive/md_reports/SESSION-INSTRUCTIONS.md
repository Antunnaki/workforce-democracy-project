# Session Instructions - AI Fix Handover

## 📋 What This Session Accomplished

✅ **AI Citations Fixed**: Now shows real sources instead of [1][2][3]
✅ **AI Tone Fixed**: Conversational instead of formal/robotic
✅ **LOCAL_NEWS_SOURCES Fixed**: No more undefined errors
✅ **Documentation Created**: Ready to update PROJECT_MASTER_GUIDE.md

---

## 🎯 Current Task: Update PROJECT_MASTER_GUIDE.md

You need to add two things to the master guide:
1. AI fix handover notes (what was fixed in this session)
2. Command pasting guide (prevent future pasting mistakes)

---

## 📁 Files in This Directory

| File | Purpose | Action |
|------|---------|--------|
| `PASTE-THIS-INTO-BASH.txt` | Contains bash command to add handover notes | Read it, copy bash command, paste in SSH |
| `NEXT-add-command-guide.txt` | Contains bash command to add pasting guide | Read it, copy bash command, paste in SSH (after first step) |
| `SESSION-INSTRUCTIONS.md` | This file - overview and instructions | Read for context |
| `PROJECT_MASTER_GUIDE.md` | Your current master guide (from server) | Reference only |

---

## ⚠️ CRITICAL: How to Use These Files

### ❌ WRONG WAY (causes errors):
- Opening `PASTE-THIS-INTO-BASH.txt`
- Copying the markdown content (## Handover Notes...)
- Pasting into bash terminal
- Result: `bash: ##: command not found`

### ✅ RIGHT WAY (works perfectly):
- Opening `PASTE-THIS-INTO-BASH.txt`
- Finding the section between "COPY FROM HERE" markers
- Copying the COMPLETE bash command (starts with `cd /var/www`, ends with `tail -50`)
- Pasting that complete command into SSH terminal
- Result: ✅ Content added to PROJECT_MASTER_GUIDE.md automatically

---

## 🔧 Step-by-Step Process

### Step 1: Add Handover Notes

```bash
# What you'll paste (example - get actual command from PASTE-THIS-INTO-BASH.txt):

cd /var/www/workforce-democracy/backend/
cp PROJECT_MASTER_GUIDE.md PROJECT_MASTER_GUIDE.md.backup-$(date +%Y%m%d-%H%M%S)
cat >> PROJECT_MASTER_GUIDE.md << 'EOF'
[handover notes content]
EOF
tail -50 PROJECT_MASTER_GUIDE.md
```

**Where to find it**: `PASTE-THIS-INTO-BASH.txt` (between the arrow markers)

---

### Step 2: Add Command Pasting Guide

```bash
# What you'll paste (example - get actual command from NEXT-add-command-guide.txt):

cd /var/www/workforce-democracy/backend/
cat >> PROJECT_MASTER_GUIDE.md << 'EOF'
[command pasting guide content]
EOF
tail -80 PROJECT_MASTER_GUIDE.md
```

**Where to find it**: `NEXT-add-command-guide.txt` (between the arrow markers)

---

## 🎓 Understanding the Command Structure

When you see this:

```bash
cat >> filename << 'EOF'
Content goes here
More content
EOF
```

**This is called a "heredoc"** - it's bash syntax that means:
- `cat >>` = append to file
- `<< 'EOF'` = start of content block
- `EOF` = end of content block
- Everything between the two EOF markers gets written to the file

**You must paste the ENTIRE block**, including:
- The `cat >>` line
- All content in between
- The final `EOF` line

---

## ✅ Verification After Each Step

### After Step 1:
```bash
tail -50 /var/www/workforce-democracy/backend/PROJECT_MASTER_GUIDE.md
```

**You should see**:
- "## 🔧 HANDOVER LOG: AI Tone & Citation Fixes"
- Details about the three problems fixed
- Testing results
- Next AI assistant instructions

### After Step 2:
```bash
tail -80 /var/www/workforce-democracy/backend/PROJECT_MASTER_GUIDE.md
```

**You should see**:
- "## 🖥️ COMMAND PASTING GUIDE"
- Scenarios for what to paste
- Quick reference table
- Examples of errors and solutions

---

## 🚨 If You See Errors

**Error**: `-bash: ##: command not found`
**Cause**: You pasted markdown content instead of the bash command
**Solution**: Copy the COMPLETE bash command (including `cat >>` and `EOF`)

**Error**: `-bash: **System: command not found`
**Cause**: You pasted markdown content instead of the bash command
**Solution**: Copy the COMPLETE bash command (including `cat >>` and `EOF`)

**Error**: `-bash: syntax error near unexpected token`
**Cause**: You pasted JavaScript or markdown instead of bash command
**Solution**: Copy the COMPLETE bash command (including `cat >>` and `EOF`)

---

## 📊 Progress Tracking

**Session Goals**:
- [x] Fix AI citations (completed on server)
- [x] Fix AI tone (completed on server)
- [x] Fix LOCAL_NEWS_SOURCES (completed on server)
- [x] Create handover documentation (files ready)
- [ ] Add handover to PROJECT_MASTER_GUIDE.md (Step 1 - you do this)
- [ ] Add command pasting guide (Step 2 - you do this)

**After This Session**:
- [ ] Step 1: Frontend bias labels
- [ ] Step 2: International APIs
- [ ] Step 3: Monthly RSS monitoring
- [ ] Step 4: Wire service alternatives

---

## 🎉 When You're Done

After completing both steps, you'll have:

✅ Complete documentation of AI fixes
✅ Clear guide to prevent command pasting mistakes
✅ Updated PROJECT_MASTER_GUIDE.md ready for next AI assistant
✅ Ready to proceed with Steps 1-4 (bias labels, international APIs, etc.)

The next AI assistant will read PROJECT_MASTER_GUIDE.md first and have complete context about what was accomplished and what needs to be done next.

---

**Remember**: When in doubt about what to paste, look for:
- `cd` = bash command ✅
- `cat >>` = bash command ✅
- `sed -i` = bash command ✅
- `##` or `**` at start of line = file content ❌ (wait for bash command that wraps it)
