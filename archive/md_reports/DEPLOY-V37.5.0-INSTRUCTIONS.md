# v37.5.0 Citation Fix - EASIEST Deployment Method

## 🎯 The Problem
- LLM generates many citations (e.g., [1] through [15])
- Backend only provides 3 actual source objects  
- Frontend shows broken citations

## ✅ The Solution (v37.5.0)
Pre-search sources **BEFORE** calling the LLM, so it knows exactly which sources exist and only uses those citation numbers.

---

## 📋 EASIEST METHOD: Copy-Paste Commands

**Just copy and paste this entire block into your SSH terminal:**

```bash
cd /var/www/workforce-democracy/backend

# 1. Create backup
echo "📦 Creating backup..."
cp ai-service.js ai-service-BACKUP-pre-v37.5.0-$(date +%Y%m%d-%H%M%S).js

# 2. Apply startup markers (at line 19, after the header comment)
echo "🔧 Adding startup markers..."
sed -i '19 a\
console.log('\''🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED - CITATION FIX ACTIVE 🚀🚀🚀'\'');\
console.log('\''📅 File loaded at:'\''

, new Date().toISOString());\
console.log('\''✨ Features: Pre-search sources BEFORE LLM call to prevent citation mismatches'\'');' ai-service.js

# 3. Clear Node.js module cache by adding to server.js
echo "🔧 Adding cache-clear to server.js..."
if ! grep -q "delete require.cache" server.js; then
    sed -i '/const.*= require.*ai-service/i\
// V37.5.0: Clear module cache to force fresh load\
delete require.cache[require.resolve('\''./ai-service'\'')];' server.js
fi

# 4. Restart PM2 completely
echo "🔄 Restarting PM2..."
pm2 stop backend
pm2 delete backend  
pm2 start server.js --name backend

# 5. Check logs
echo ""
echo "📋 Checking logs for v37.5.0 markers..."
sleep 2
pm2 logs backend --lines 20 --nostream | grep -E "🚀|Server running"

echo ""
echo "✅ If you see the rockets (🚀🚀🚀), the file is loading!"
echo "If NOT, we need to apply the full v37.5.0 file manually."
```

---

## 🔍 What to Look For

After running the commands above, you should see in the logs:

```
🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED - CITATION FIX ACTIVE 🚀🚀🚀
📅 File loaded at: 2025-11-07T...
✨ Features: Pre-search sources BEFORE LLM call to prevent citation mismatches
```

### If You See the Rockets ✅
**The startup markers are loading!** But we still need to apply the FULL v37.5.0 logic changes.

I'll provide you with the complete corrected `ai-service.js` file content that you can paste directly.

### If You DON'T See the Rockets ❌
The file changes aren't being loaded. We'll need to debug the caching issue first.

---

## 📥 ALTERNATIVE: Download Complete v37.5.0 File

If the above doesn't work, I can provide you with:

1. **Complete file content** - paste into nano/vim
2. **Download URL** - wget/curl a pre-made v37.5.0 file  
3. **SFTP upload** - download from this chat and upload via SFTP

**Which method would you prefer if the simple commands above don't work?**

---

## 🧪 Testing After Deployment

Once v37.5.0 is active, test the chat and look for these new logs:

```
🔍 Pre-searching sources before LLM call...
📚 Found 3 sources to provide to LLM
✅ Providing 3 validated sources to LLM
🤖 AI Query: "..." (context: general, sources: 3)
```

**Expected behavior:**
- LLM generates citations [1] through [3]
- Backend provides exactly 3 sources
- Frontend displays all citations as clickable
- NO more mismatches!
