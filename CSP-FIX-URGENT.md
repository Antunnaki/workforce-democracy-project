# CSP FIX - URGENT (V36.5.2)

**Issue Found**: Content Security Policy blocking backend API calls

---

## The Error:

```
Refused to connect to https://185.193.126.13/api/chat/query 
because it does not appear in the connect-src directive of 
the Content Security Policy.
```

---

## Root Cause:

Netlify's default CSP doesn't allow connections to your VPS IP address.

---

## Solution: Add `_headers` File

This file tells Netlify to allow connections to your backend.

---

## Step 1: Download `_headers` from GenSpark

I just created a file called `_headers` (no extension) that contains:

```
/*
  Content-Security-Policy: default-src 'self' https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://185.193.126.13 https://185.193.126.13 https://api.groq.com https://*.netlify.app; frame-src 'self'
```

Key part: `connect-src 'self' http://185.193.126.13 https://185.193.126.13`

---

## Step 2: Place `_headers` in Root Directory

Your project structure should look like:

```
your-project/
├── _headers          ← ADD THIS FILE (root level)
├── index.html
├── css/
├── js/
└── ...
```

**Important**: `_headers` must be in the **root directory**, same level as `index.html`

---

## Step 3: Upload to Netlify

1. Download `_headers` from GenSpark
2. Place it in root of your project folder
3. Upload entire project to Netlify (drag & drop)
4. Wait for deployment

---

## Step 4: Test

1. Hard refresh: Cmd+Shift+R
2. Open Console (F12)
3. Ask Supreme Court chat: "Tell me about student loans"
4. Should work now!

---

## Alternative: Quick Fix via Netlify Dashboard

If you can't download/upload, you can add this via Netlify:

1. Go to Netlify Dashboard
2. Your site → Site configuration → Build & deploy
3. Scroll to "Post processing" → "Snippet injection"
4. Add this in `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https: http:; connect-src 'self' http://185.193.126.13 https://185.193.126.13;">
```

But the `_headers` file method is better!

---

## What This Does:

Tells the browser: "It's okay to connect to http://185.193.126.13 (our backend)"

---

## After Fix:

Console should show:
```
[Backend API] 📤 Sending query to backend
[Backend API] ✅ Response received
```

VPS logs should show:
```
📥 Query from supreme_court: "..."
🤖 AI response!
```

---

**Download `_headers` file, add to project root, re-upload to Netlify!** 🚀
