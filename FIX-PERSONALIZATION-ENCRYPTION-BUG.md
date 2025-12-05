# 🔧 CRITICAL BUG FIX: Personalization Encryption Mismatch

## 🐛 THE BUG

**Root Cause:** The system stores **plain JSON** in localStorage but backend expects **encrypted base64**.

### What's Happening:

```javascript
// During Registration (js/personalization-system.js line 134-160)
const { encrypted, iv } = await CryptoUtils.encrypt(initialData, password, salt);

// ✅ Sends encrypted base64 to backend
fetch('/api/personalization/register', {
  body: JSON.stringify({
    encrypted_data: encrypted,  // ✅ Base64 encrypted
    iv, encryption_salt: salt
  })
});

// ❌ Stores PLAIN JSON in localStorage
localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(initialData)); // ❌ NOT encrypted!
```

### During Sync (line 631):
```javascript
// ❌ Sends PLAIN JSON to backend, overwrites encrypted data
fetch('/api/personalization/sync', {
  body: JSON.stringify({
    encrypted_data: localStorage.getItem(STORAGE_KEYS.USER_DATA) // ❌ Plain JSON!
  })
});
```

### During Session Recovery (line 340):
```javascript
// Backend returns the plain JSON it received from sync
const userData = await CryptoUtils.decrypt(
  encrypted_data,  // ❌ This is plain JSON, not base64!
  iv,
  password,
  encryption_salt
);

// crypto-utils.js line 211 tries to decode
const binary = atob(base64);  // ❌ Throws: InvalidCharacterError!
```

## ✅ THE FIX

We need to keep password in memory during the session to re-encrypt before syncing.

### Option 1: Keep Password in Memory (Recommended)

```javascript
// Add to PersonalizationSystem
this.sessionPassword = null; // Store in memory during session

async register(username, password) {
  // ... existing code ...
  
  // Store password in memory for session
  this.sessionPassword = password;
  
  // ... rest of code ...
}

async syncToServer() {
  if (!this.sessionPassword) {
    console.warn('⚠️ Cannot sync: password not in memory');
    return;
  }
  
  const userData = this.getUserData();
  const salt = localStorage.getItem(this.STORAGE_KEYS.SALT);
  
  // Re-encrypt before sending
  const { encrypted, iv } = await CryptoUtils.encrypt(userData, this.sessionPassword, salt);
  
  const response = await fetch(`${this.API_BASE}/sync`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: this.getUsername(),
      encrypted_data: encrypted,  // ✅ Now properly encrypted!
      iv: iv,
      last_sync: new Date().toISOString()
    })
  });
}
```

### Option 2: Store Encrypted Data in localStorage (More Secure)

Store encrypted data in localStorage and decrypt on every read:

```javascript
// Store encrypted
localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encrypted);
localStorage.setItem(STORAGE_KEYS.IV, iv);

// Read and decrypt
getUserData() {
  if (!this.sessionPassword) return null;
  
  const encrypted = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
  const iv = localStorage.getItem(STORAGE_KEYS.IV);
  const salt = localStorage.getItem(STORAGE_KEYS.SALT);
  
  return await CryptoUtils.decrypt(encrypted, iv, this.sessionPassword, salt);
}
```

## 🎯 RECOMMENDATION

**Use Option 1** because:
1. ✅ Less code changes
2. ✅ Better performance (no decrypt on every read)
3. ✅ Data is still encrypted in transit and at rest on backend
4. ✅ localStorage is already cleared by Fire button anyway

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Add `sessionPassword` property to PersonalizationSystem
- [ ] Store password in memory during register()
- [ ] Store password in memory during login()
- [ ] Clear password on logout()
- [ ] Update syncToServer() to re-encrypt before sending
- [ ] Update backend sync endpoint to expect iv parameter
- [ ] Test full flow: register → sync → fire button → restore

## 🚨 SECURITY NOTE

Keeping password in memory is acceptable because:
- Memory is cleared when tab closes
- Fire button clears memory anyway
- The alternative (storing password hash) wouldn't work for encryption
- Backend still stores encrypted data
- Session cookie is HttpOnly and can't be accessed by JS

The localStorage data being plain is actually fine since:
- Fire button clears it anyway
- The backup on the backend IS encrypted
- No other site can access your localStorage

## 📝 NEXT STEPS

1. Deploy this fix to `js/personalization-system.js`
2. Update `backend/routes/personalization.js` to accept `iv` in sync endpoint
3. Test with fresh registration
4. Verify sync works correctly
5. Test Fire button recovery still works
