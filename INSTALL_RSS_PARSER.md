# Install RSS Parser Package

## 📦 **Required Package**

The RSS service needs the `rss-parser` NPM package.

## 🚀 **Installation**

```bash
# SSH to server
ssh root@185.193.126.13

# Navigate to backend
cd /var/www/workforce-democracy/backend

# Install rss-parser
npm install rss-parser

# Verify installation
npm list rss-parser

# Expected output: rss-parser@3.13.0 (or similar)
```

## ✅ **Verification**

After installation, verify the package is in `package.json`:

```bash
cat package.json | grep rss-parser
```

Should show:
```
"rss-parser": "^3.13.0"
```

## 📝 **What This Package Does**

- Parses RSS/Atom feeds from news sources
- Handles various RSS formats (RSS 1.0, RSS 2.0, Atom)
- Extracts titles, descriptions, links, dates
- Timeout handling for slow feeds
- Lightweight and well-maintained

## 🔗 **Package Info**

- **NPM**: https://www.npmjs.com/package/rss-parser
- **GitHub**: https://github.com/rbren/rss-parser
- **License**: MIT (Free to use)
- **Size**: ~50KB
- **Dependencies**: Minimal

## ⚠️ **Note**

This installation is required BEFORE deploying v37.3.0. If you deploy without it, the backend will crash with:

```
Error: Cannot find module 'rss-parser'
```
