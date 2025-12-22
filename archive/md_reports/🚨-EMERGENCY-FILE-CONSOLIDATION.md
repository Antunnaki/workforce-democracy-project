# 🚨 EMERGENCY: Multiple Backend Servers Found

**Date**: November 2, 2025  
**Issue**: You're running a DIFFERENT backend than what's in this project  
**Priority**: CRITICAL - Must consolidate immediately

---

## 🔴 **THE PROBLEM**

You have **MULTIPLE backend servers** and we've been editing the WRONG ONE!

### **Server 1: What You're Showing Me**
```javascript
// Location: Unknown (on your VPS?)
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Groq = require('groq-sdk');
const usReps = require('./us-representatives');  // ✅ Already imports!
```

### **Server 2: What's in This Project**
```javascript
// Location: backend/server.js (in this project)
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();
// ... NO Groq import, uses PostgreSQL database
```

**These are COMPLETELY DIFFERENT backends!**

---

## 📊 **WHICH SERVER ARE YOU ACTUALLY RUNNING?**

Please tell me:

### **Question 1: What's on your VPS?**
SSH into your server and run:
```bash
cat /var/www/workforce-democracy/backend/server.js | head -20
```

Or wherever your backend is located. Show me the first 20 lines.

### **Question 2: What does your PM2 show?**
```bash
pm2 list
pm2 describe workforce-democracy-backend
```

What file is PM2 actually running?

---

## 🎯 **IMMEDIATE ACTION NEEDED**

### **Option A: You're Running Server 1 (Groq-based)**

If your VPS server.js starts with:
```javascript
const Groq = require('groq-sdk');
const usReps = require('./us-representatives');
```

**Then you already have the import!** You just need to add the endpoint.

**Copy this entire block** and add it to your VPS server.js:

```javascript
// Add this endpoint wherever your other app.post/app.get endpoints are

app.post('/api/civic/representatives', async (req, res) => {
    try {
        const { location } = req.body;
        const zipCode = location?.zipCode || location?.zip;
        
        if (!zipCode || !/^\d{5}$/.test(zipCode)) {
            return res.status(400).json({
                success: false,
                error: 'Valid 5-digit ZIP code required'
            });
        }
        
        console.log(`🔍 [CIVIC-REPS] Looking up: ${zipCode}`);
        
        const result = await usReps.getRepresentativesByZip(zipCode);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                representatives: []
            });
        }
        
        console.log(`✅ Found ${result.representatives.length} reps`);
        
        res.json({
            success: true,
            representatives: result.representatives,
            counts: result.counts,
            location_used: result.location_used,
            data_sources: result.data_sources
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            representatives: []
        });
    }
});
```

---

### **Option B: You're Running Server 2 (PostgreSQL-based)**

If your VPS server.js starts with:
```javascript
const { Pool } = require('pg');
const crypto = require('crypto');
```

Then follow my previous guide to:
1. Add import
2. Add endpoint

---

## 🗂️ **FILE CLEANUP NEEDED**

You have these duplicate/old files in this project:

```
backend-server-example.js         ← OLD example (V36.2.0) - DELETE
backend/server.js                 ← Current project version
Your actual VPS server.js         ← Unknown location, unknown version
```

### **Cleanup Steps**:

1. **Delete old example**:
```bash
rm backend-server-example.js
```

2. **Find your actual running server**:
```bash
# On your VPS:
ps aux | grep node
# Or:
pm2 describe workforce-democracy-backend | grep "script path"
```

3. **Decide which to keep**:
   - If VPS has Groq + usReps import → Keep that, update this project to match
   - If VPS matches backend/server.js → Update VPS with changes

---

## ✅ **WHAT YOU NEED TO DO RIGHT NOW**

1. **SSH into your VPS**
2. **Run this command**:
```bash
cat /var/www/workforce-democracy/backend/server.js | head -30
```

3. **Copy the first 30 lines and show me**

4. **Run this**:
```bash
pm2 describe workforce-democracy-backend
```

5. **Show me the output**

Then I can give you the EXACT code for YOUR ACTUAL server!

---

## 🎯 **ROOT CAUSE**

You're right - the confusion has been because of duplicate files. We need to:

1. ✅ Identify which server you're actually running
2. ✅ Delete old example files
3. ✅ Update only the ONE real server
4. ✅ Make this project match your VPS exactly

---

**Please show me the output of the commands above so I can give you the correct implementation!**
