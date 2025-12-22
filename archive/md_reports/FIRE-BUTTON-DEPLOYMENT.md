# Fire Button Support - Deployment Guide

## 🎯 Overview

This update adds persistent session support that survives DuckDuckGo's Fire button and other cache-clearing operations.

### What's New:
- ✅ **Session cookies** - HttpOnly cookies that persist across Fire button usage
- ✅ **Backend session storage** - MongoDB sessions that survive browser data clears
- ✅ **Auto-restore** - Automatic session recovery with password prompt
- ✅ **URL fallback** - Session token in URL hash as last resort
- ✅ **User notifications** - Clear messaging about Fire button usage

---

## 📋 Files Changed

### Backend Files:
1. `backend/models/Session.js` - **NEW** - Session model for MongoDB
2. `backend/routes/personalization.js` - Updated with session endpoints
3. `backend/server.js` - Added cookie-parser middleware

### Frontend Files:
1. `js/personalization-system.js` - Added session recovery logic

### Deployment Scripts:
1. `install-cookie-parser.sh` - Installs cookie-parser on VPS

---

## 🚀 Deployment Steps

### Step 1: Backend Deployment (VPS)

```bash
# SSH to VPS
ssh root@185.193.126.13

# Navigate to backend directory
cd /var/www/workforce-democracy/backend

# Upload new files (using scp from local machine):
# scp backend/models/Session.js root@185.193.126.13:/var/www/workforce-democracy/backend/models/
# scp backend/routes/personalization.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/
# scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Install cookie-parser
npm install cookie-parser

# Restart backend
/opt/nodejs/bin/pm2 restart backend

# Check logs
/opt/nodejs/bin/pm2 logs backend --lines 20
```

Expected output:
```
✅ MongoDB connected successfully
✅ Server running on port 3001
```

### Step 2: Frontend Deployment (GenSparkSpace)

Upload updated file:
- `js/personalization-system.js`

Or deploy via Git:
```bash
git add js/personalization-system.js
git commit -m "Add Fire button session recovery support"
git push
```

### Step 3: Nginx Configuration (Optional)

Ensure cookies are allowed through Nginx proxy:

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-enabled/workforce-backend

# Ensure these directives exist:
proxy_set_header Cookie $http_cookie;
proxy_pass_header Set-Cookie;

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 Testing

### Test 1: Normal Registration (Baseline)

1. Go to https://sxcrlfyt.gensparkspace.com/
2. Register new account: `firetest1`
3. Complete setup
4. Check console for:
   ```
   ✅ Registration successful
   🔒 Session cookie set - you can use Fire button and still stay logged in!
   ```
5. Normal refresh (F5) - Should stay logged in ✅

### Test 2: Fire Button Recovery

1. After registration, use Fire button 🔥
2. Refresh page
3. Should see:
   ```
   🔍 Checking for backend session...
   🔄 Restoring session for: firetest1
   ```
4. Enter password when prompted
5. Should see:
   ```
   ✅ Session restored successfully!
   Session restored! Your data is safe.
   ```
6. Check that you're logged in ✅

### Test 3: Complete Fire Button (Cookies Cleared)

1. Register account
2. Fire button + manually clear cookies
3. Refresh page
4. Should show welcome banner (no session)
5. Click "Log In"
6. Enter credentials
7. Should log back in successfully ✅

---

## 📊 Expected User Experience

### Scenario 1: User with Fire Button (Session Cookie Survives)

```
User: *Registers account*
System: ✅ "Account created! Session cookie set"

User: *Uses Fire button* 🔥
System: *localStorage cleared, cookie remains*

User: *Refreshes page*
System: "Welcome back, firetest1! Enter your password to restore your session"

User: *Enters password*
System: ✅ "Session restored! Your data is safe."
        *User stays logged in*
```

### Scenario 2: User with Fire Button (Cookie Also Cleared)

```
User: *Registers account*
User: *Uses Fire button + clears cookies*

User: *Refreshes page*
System: *Shows welcome banner*

User: *Clicks "Log In"*
User: *Enters credentials*
System: ✅ "Login successful!"
        *User logged in, new session created*
```

---

## 🔒 Security Considerations

### What's Secure:
- ✅ Session tokens are cryptographically random (32 bytes)
- ✅ HttpOnly cookies prevent JavaScript access (XSS protection)
- ✅ Data remains encrypted (password required to decrypt)
- ✅ Session expiration after 30 days
- ✅ No passwords stored in session

### What Users See:
- Password prompt after Fire button usage
- Clear messaging about Fire button behavior
- Tips about using normal refresh (F5)

---

## 📚 User Education

### Console Tips (Added):
```javascript
console.log('🔒 Session cookie set - you can use Fire button and still stay logged in!');
console.log('💡 TIP: When you use Fire button, you\'ll be prompted for your password to decrypt your data');
```

### Recommended FAQ Entry:

**Q: What happens when I use the Fire button?**

A: The Fire button clears your browser's local storage, but your data is safe! We use multiple recovery methods:

1. **Session cookie** (usually survives Fire button) - You'll be prompted for your password to decrypt your data
2. **Backend storage** - Your encrypted data is always backed up on our server
3. **Quick re-login** - If all else fails, just log back in with your username and password

Your personalization data is encrypted with zero-knowledge encryption, so it's always safe even if you clear all browser data!

**Pro tip:** Use normal refresh (F5) instead of Fire button if you want to stay logged in without re-entering your password.

---

## 🐛 Troubleshooting

### Issue: Session not restoring after Fire button

**Check:**
```bash
# On VPS, check if sessions are being created
mongosh workforce_democracy
db.sessions.find().pretty()
```

Should see session documents with tokens.

**Fix:**
- Ensure cookie-parser is installed: `npm list cookie-parser`
- Check Nginx proxy headers: `proxy_pass_header Set-Cookie`
- Verify browser accepts cookies from domain

### Issue: Password prompt not showing

**Check console:**
```javascript
PersonalizationSystem.pendingSessionRestore
```

Should show session data if restore is pending.

**Fix:**
- Check network tab for `/session` endpoint call
- Verify response includes encrypted_data and iv
- Check browser console for JavaScript errors

### Issue: "Incorrect password" after Fire button

**Likely cause:** User entered wrong password

**Fix:**
- Show clearer password input (not browser prompt)
- Add "Forgot password?" link to recovery key flow
- Log detailed error messages

---

## 🎯 Success Criteria

✅ User can register and stay logged in  
✅ User can use Fire button and restore session with password  
✅ User can log back in if session expires  
✅ Session cookies are set correctly  
✅ Session recovery prompts for password  
✅ User sees helpful notifications and tips  

---

## 📋 Rollback Plan

If issues occur:

```bash
# On VPS
cd /var/www/workforce-democracy/backend

# Restore old files from backup
cp routes/personalization.js.backup routes/personalization.js
cp server.js.backup server.js

# Restart
/opt/nodejs/bin/pm2 restart backend
```

Frontend:
- Revert `js/personalization-system.js` to previous version

---

## 🚀 Future Enhancements

1. **Better password prompt** - Replace browser `prompt()` with nice modal
2. **Remember device** - Don't prompt for password on trusted devices
3. **Biometric auth** - Use WebAuthn for passwordless restore
4. **Progressive Web App** - Service worker persistence
5. **Sync indicators** - Show when session is restored vs localStorage

---

**Version:** 1.0.0-FIRE-BUTTON-SUPPORT  
**Date:** January 18, 2025  
**Status:** Ready for deployment  
**Priority:** High - Improves UX for privacy-conscious users
