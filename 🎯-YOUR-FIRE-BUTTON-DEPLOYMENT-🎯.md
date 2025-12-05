# 🔥 Fire Button Support - YOUR Deployment Guide

**Current Location**: You're already logged into VPS at `/var/www/workforce-democracy/backend` ✅

---

## 📋 **Your Workflow Overview**

Based on the master architecture document, here's YOUR specific deployment process:

### **Your Setup:**
- 💻 **Machine**: Mac
- 📁 **Local Storage**: Version-numbered folders (e.g., `WDP-v37.11.4-PERSONALIZATION`)
- 🌐 **Frontend**: Deploy to GenSparkSpace first, then Netlify (drag-and-drop)
- 🖥️ **Backend**: Upload .sh scripts to VPS and execute
- ✅ **VPS Location**: `/var/www/workforce-democracy/backend/` (you're here now!)

---

## 🚀 **PART 1: Backend Deployment (VPS)**

### **Step 1: Create New Files on VPS**

You're already in: `/var/www/workforce-democracy/backend/`

#### **Create Session Model:**
```bash
# Create the Session model file
cat > models/Session.js << 'ENDOFFILE'
/**
 * SESSION MODEL
 * For persistent login across Fire button / cache clears
 * 
 * Philosophy: Backend session tokens survive browser data clearing
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const SessionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true,
    index: true
  },
  last_accessed: {
    type: Date,
    default: Date.now
  },
  user_agent: {
    type: String
  },
  ip_address: {
    type: String
  }
});

// Auto-delete expired sessions
SessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

/**
 * Generate a new session token
 */
SessionSchema.statics.createSession = async function(username, duration = 30 * 24 * 60 * 60 * 1000, metadata = {}) {
  // Generate cryptographically secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  const session = new this({
    username,
    token,
    expires_at: new Date(Date.now() + duration),
    user_agent: metadata.userAgent,
    ip_address: metadata.ipAddress
  });
  
  await session.save();
  return session;
};

/**
 * Validate and refresh session
 */
SessionSchema.statics.validateSession = async function(token) {
  const session = await this.findOne({ 
    token,
    expires_at: { $gt: new Date() }
  });
  
  if (session) {
    // Update last accessed time
    session.last_accessed = new Date();
    await session.save();
  }
  
  return session;
};

/**
 * Delete user's sessions (logout)
 */
SessionSchema.statics.deleteUserSessions = async function(username) {
  await this.deleteMany({ username });
};

module.exports = mongoose.model('Session', SessionSchema);
ENDOFFILE

echo "✅ Session.js created"
```

#### **Step 2: Backup Existing Files**
```bash
# Create backup of files we're going to modify
cp routes/personalization.js routes/personalization.js.backup-$(date +%Y%m%d)
cp server.js server.js.backup-$(date +%Y%m%d)

echo "✅ Backup created"
```

#### **Step 3: Download Updated Files from GenSpark**

I'll provide the updated files. You'll need to:
1. Download `personalization.js` from GenSpark workspace
2. Download `server.js` from GenSpark workspace
3. Upload them to VPS

**For now, let me show you the changes to make manually:**

---

### **Manual Edit Option (Faster):**

#### **Edit server.js:**
```bash
# Add cookie-parser to imports (line 14-16 area)
nano server.js
```

Find this line (around line 15):
```javascript
const cors = require('cors');
```

Add AFTER it:
```javascript
const cookieParser = require('cookie-parser');
```

Find this line (around line 63):
```javascript
app.use(express.json());
```

Add AFTER it:
```javascript
app.use(cookieParser()); // For session cookies
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

---

#### **Edit routes/personalization.js:**
```bash
nano routes/personalization.js
```

Find the VERY END of the file (around line 341):
```javascript
module.exports = router;
```

**REPLACE** that single line with this entire block:
```javascript
/**
 * Get session data (for Fire button recovery)
 * GET /api/personalization/session
 */
router.get('/session', async (req, res) => {
  try {
    const sessionToken = req.cookies?.wdp_session;
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }

    const Session = require('../models/Session');
    const session = await Session.validateSession(sessionToken);
    
    if (!session) {
      res.clearCookie('wdp_session');
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    const userBackup = await UserBackup.findOne({ username: session.username });
    
    if (!userBackup) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      success: true,
      username: userBackup.username,
      encrypted_data: userBackup.encrypted_data,
      iv: userBackup.iv,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync,
      restored_from_session: true
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

module.exports = router;
```

Save and exit.

---

Now find the register endpoint (around line 64-70), locate this:
```javascript
    await userBackup.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      username
    });
```

**REPLACE** with:
```javascript
    await userBackup.save();

    // Create session token for persistent login
    const Session = require('../models/Session');
    const session = await Session.createSession(username, 30 * 24 * 60 * 60 * 1000, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Set session cookie
    res.cookie('wdp_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      username,
      session_token: session.token
    });
```

---

Find the login endpoint (around line 113-119), locate this:
```javascript
    res.json({
      success: true,
      encrypted_data: userBackup.encrypted_data,
      iv: userBackup.iv,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync
    });
```

**REPLACE** with:
```javascript
    // Create session token
    const Session = require('../models/Session');
    const session = await Session.createSession(username, 30 * 24 * 60 * 60 * 1000, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    res.cookie('wdp_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      encrypted_data: userBackup.encrypted_data,
      iv: userBackup.iv,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync,
      session_token: session.token
    });
```

Save and exit.

---

### **Step 4: Install cookie-parser**
```bash
npm install cookie-parser
```

### **Step 5: Restart Backend**
```bash
/opt/nodejs/bin/pm2 restart backend
```

### **Step 6: Verify**
```bash
/opt/nodejs/bin/pm2 logs backend --lines 20
```

You should see:
```
✅ MongoDB connected successfully
✅ Server running on port 3001
```

---

## 🎨 **PART 2: Frontend Deployment**

### **On Your Mac (GenSpark Workspace):**

1. **Download updated `personalization-system.js`** from GenSpark workspace
   - File location: `js/personalization-system.js`
   - This file now has session recovery logic

2. **Save to your local project folder**
   - Your version folder (e.g., `WDP-v37.11.5-FIRE-BUTTON`)
   - Overwrite the old `js/personalization-system.js`

3. **Deploy to GenSparkSpace FIRST** (testing)
   - Use GenSpark's deployment method (you know how)
   - Test with Fire button before going to production

4. **Deploy to Netlify SECOND** (production)
   - Drag and drop folder to Netlify
   - Clear browser cache and test

---

## 🧪 **PART 3: Testing**

### **Test on GenSparkSpace:**

1. Open https://sxcrlfyt.gensparkspace.com/
2. Open console (F12)
3. Register new account: `firetest1`
4. Complete setup
5. Check console for:
   ```
   ✅ Registration successful
   🔒 Session cookie set - you can use Fire button and still stay logged in!
   ```
6. **Use Fire button** 🔥
7. **Refresh page**
8. Should see password prompt:
   ```
   Welcome back, firetest1!
   Enter your password to restore your session
   ```
9. Enter password
10. Should restore and log in! ✅

### **Verify on VPS:**
```bash
# Check MongoDB for sessions
mongosh workforce_democracy

# In MongoDB shell:
db.sessions.find().pretty()

# Should see session document with token
```

---

## 📊 **Your Deployment Checklist**

### **Backend (VPS) - You're doing this NOW:**
- [ ] Create `models/Session.js` (cat command above)
- [ ] Backup existing files
- [ ] Edit `server.js` (add cookie-parser)
- [ ] Edit `routes/personalization.js` (add session endpoints)
- [ ] Run `npm install cookie-parser`
- [ ] Restart: `/opt/nodejs/bin/pm2 restart backend`
- [ ] Check logs: `/opt/nodejs/bin/pm2 logs backend --lines 20`
- [ ] Verify MongoDB sessions collection exists

### **Frontend (Mac → GenSparkSpace → Netlify):**
- [ ] Download `js/personalization-system.js` from GenSpark
- [ ] Save to local project folder
- [ ] Deploy to GenSparkSpace (test first)
- [ ] Test Fire button recovery
- [ ] If working, deploy to Netlify
- [ ] Clear cache and test production

---

## 🎯 **Quick Commands Reference**

```bash
# You're here now:
pwd  # Should show: /var/www/workforce-democracy/backend

# Check if Session.js exists:
ls -la models/Session.js

# View PM2 status:
/opt/nodejs/bin/pm2 list

# Restart backend:
/opt/nodejs/bin/pm2 restart backend

# View logs:
/opt/nodejs/bin/pm2 logs backend --lines 50

# Check MongoDB:
mongosh workforce_democracy --eval "db.sessions.countDocuments()"

# Check if cookie-parser installed:
npm list cookie-parser
```

---

## 💡 **What This Does**

When a user uses the Fire button:
1. localStorage gets cleared ✅ (expected)
2. Session cookie **remains** ✅ (our fix!)
3. Page refresh → Backend checks cookie
4. Finds valid session → Prompts for password
5. User enters password → Data decrypted
6. Restores to localStorage → User logged in! 🎉

---

**Ready to start? You're already in the right directory!** 🚀

Just run the commands in **PART 1** step by step, then we'll do the frontend deployment from your Mac/GenSpark workspace.
