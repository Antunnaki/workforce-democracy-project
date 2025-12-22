# 🚀 Deployment Guide - Workforce Democracy Project

This guide covers deploying the Workforce Democracy Project to various hosting platforms.

---

## Prerequisites

### Required
- ✅ All project files from this repository
- ✅ HTTPS-enabled hosting (required for Web Crypto API)
- ✅ Static file serving capability

### Not Required
- ❌ No server-side processing
- ❌ No database setup
- ❌ No environment variables
- ❌ No build process

---

## Quick Deploy Options

### 1. Netlify (Recommended)

**One-Click Deploy**
1. Connect your GitHub repository
2. Set build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
3. Deploy!

**Manual Deploy**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from project directory
netlify deploy --prod
```

**Configuration** (`netlify.toml`):
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### 2. Vercel

**GitHub Integration**
1. Import your repository
2. Framework: None
3. Root Directory: `./`
4. Deploy

**CLI Deploy**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 3. GitHub Pages

**Via GitHub Actions**
1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Use default static site workflow
4. Commit and push

**Manual Process**
```bash
# Create gh-pages branch
git checkout -b gh-pages

# Push to GitHub
git push origin gh-pages

# Enable in repository settings
```

**Custom Domain Setup**
1. Add `CNAME` file with your domain
2. Configure DNS:
   - Type: `A`
   - Name: `@`
   - Value: GitHub Pages IPs
3. Enable HTTPS in settings

### 4. Cloudflare Pages

**Git Integration**
1. Connect repository
2. Build settings:
   - Build command: *(none)*
   - Output directory: `.`
3. Deploy

**Wrangler CLI**
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish .
```

### 5. AWS S3 + CloudFront

**S3 Setup**
```bash
# Create bucket
aws s3 mb s3://workforce-democracy-project

# Upload files
aws s3 sync . s3://workforce-democracy-project

# Enable static website hosting
aws s3 website s3://workforce-democracy-project \
  --index-document index.html
```

**CloudFront Setup**
1. Create distribution
2. Origin: Your S3 bucket
3. Enable HTTPS (required)
4. Set default root object: `index.html`

### 6. Firebase Hosting

**Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**Configuration** (`firebase.json`):
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      },
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

---

## Security Headers

### Required Headers
These headers are critical for security:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CSP (Already in HTML)
Content Security Policy is defined in the HTML `<meta>` tag:
```html
<meta http-equiv="Content-Security-Policy" content="...">
```

---

## Custom Domain

### DNS Configuration

**Option 1: Root Domain**
```
Type: A
Name: @
Value: [Your host's IP]
```

**Option 2: Subdomain**
```
Type: CNAME
Name: www
Value: [Your host's domain]
```

**Option 3: Both (Recommended)**
Set up both root and www, redirect one to the other.

### SSL/TLS Certificate
- Most platforms provide free SSL (Let's Encrypt)
- Enable "Force HTTPS" in hosting settings
- Verify certificate after deployment

---

## Post-Deployment Checklist

### ✅ Essential Tests
- [ ] Site loads over HTTPS
- [ ] All pages accessible
- [ ] No console errors
- [ ] Service worker registers
- [ ] Charts display correctly
- [ ] Search functionality works
- [ ] Language switching works
- [ ] Privacy features functional

### ✅ Performance Tests
- [ ] Lighthouse score > 90
- [ ] Page load < 3 seconds
- [ ] Mobile-responsive
- [ ] Works offline (after first visit)

### ✅ Security Tests
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No mixed content warnings
- [ ] CSP properly configured
- [ ] No tracking detected

### ✅ Browser Tests
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## Performance Optimization

### Automatic Optimizations
Most hosting platforms provide:
- Gzip/Brotli compression
- HTTP/2 support
- CDN distribution
- Caching headers

### Manual Optimizations

**1. Image Optimization**
```bash
# If you add images, optimize them:
npm install -g imagemin-cli
imagemin images/* --out-dir=images/
```

**2. CSS Minification** (Optional)
```bash
npm install -g clean-css-cli
cleancss -o css/main.min.css css/main.css
```

**3. JavaScript Minification** (Optional)
```bash
npm install -g terser
terser js/*.js -o js/bundle.min.js
```

**Note**: Current file sizes are already small (~250KB total), so minification is optional.

---

## Monitoring

### Free Monitoring Options

**1. Uptime Monitoring**
- UptimeRobot (free)
- StatusCake (free tier)
- Pingdom (free tier)

**2. Performance Monitoring**
- Google Lighthouse (free)
- WebPageTest (free)
- GTmetrix (free)

**3. Privacy-Friendly Analytics** (Optional)
If you want basic stats without tracking:
- Plausible Analytics (privacy-friendly)
- Fathom Analytics (privacy-focused)
- Simple Analytics (GDPR compliant)

**Note**: By default, this project uses ZERO analytics to respect user privacy.

---

## Troubleshooting

### Service Worker Issues
```bash
# Clear cache and reload
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Safari: Cmd+Option+E

# Unregister service worker in DevTools
Application → Service Workers → Unregister
```

### HTTPS Errors
- Verify SSL certificate is valid
- Check for mixed content (http:// resources)
- Ensure all CDN resources use https://

### Chart.js Not Loading
- Check CDN availability
- Verify CSP allows cdn.jsdelivr.net
- Check browser console for errors

### Build Fails
This is a static site with no build process. If deployment fails:
- Verify all files are present
- Check file permissions
- Ensure no .gitignore conflicts

---

## Rollback Procedure

### Quick Rollback

**Netlify**
```bash
netlify rollback
```

**Vercel**
```bash
vercel rollback
```

**GitHub Pages**
```bash
git revert HEAD
git push origin gh-pages
```

**Manual Rollback**
1. Keep previous version in separate directory
2. Replace files with previous version
3. Clear CDN cache if applicable
4. Test thoroughly

---

## Environment-Specific Notes

### Development
- Use local server (Python/Node.js)
- Enable source maps
- Use browser DevTools

### Staging
- Test all features
- Run Lighthouse audits
- Verify all links
- Test on multiple devices

### Production
- Enable all security headers
- Monitor performance
- Set up uptime monitoring
- Document deployed version

---

## Cost Estimates

All recommended platforms have generous free tiers:

| Platform | Free Tier | Bandwidth | Storage |
|----------|-----------|-----------|---------|
| Netlify | Yes | 100GB/mo | Unlimited |
| Vercel | Yes | 100GB/mo | Unlimited |
| GitHub Pages | Yes | 100GB/mo | 1GB |
| Cloudflare Pages | Yes | Unlimited | 20GB |
| Firebase | Yes | 10GB/mo | 10GB |

**This project fits easily within all free tiers.**

---

## Support & Updates

### Getting Help
- Review deployment logs
- Check platform documentation
- Use platform support channels
- Contact via project contact form

### Keeping Updated
```bash
# Pull latest changes
git pull origin main

# Deploy updates
[Use your platform's deploy command]
```

### Version Control
- Tag releases: `git tag v1.0.0`
- Document changes in commit messages
- Maintain CHANGELOG.md (optional)

---

## Final Notes

### This Project Is:
✅ **Static** - No server-side processing  
✅ **Secure** - HTTPS required  
✅ **Private** - Zero tracking  
✅ **Fast** - < 250KB total size  
✅ **Free** - Fits in free hosting tiers  

### Required:
- HTTPS (for Web Crypto API)
- Modern browser support
- Static file serving

### Not Required:
- Database
- Backend server
- API keys
- Environment variables
- Build tools

---

**Ready to deploy? Choose a platform above and follow the steps. Your Workforce Democracy Project will be live in minutes!**

🏛️ **Workforce Democracy Project EST 2025**
