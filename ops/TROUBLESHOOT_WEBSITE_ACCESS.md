# Website Accessibility Troubleshooting Guide

## Initial Diagnosis

If the website is still not accessible after implementing the fixes, follow these steps to diagnose the issue:

## 1. DNS Resolution Check

Verify that DNS records are properly propagated:

```bash
# Check A record
dig workforcedemocracyproject.org A +short
dig www.workforcedemocracyproject.org A +short

# Check AAAA record (IPv6)
dig workforcedemocracyproject.org AAAA +short
dig www.workforcedemocracyproject.org AAAA +short
```

Expected output should show:
```
185.193.126.13
```

And for IPv6:
```
2a0a:3840:1337:126:0:b9c1:7e0d:1337
```

## 2. HTTP/HTTPS Connectivity Tests

Test basic connectivity to the server:

```bash
# Test HTTP redirect
curl -I http://workforcedemocracyproject.org

# Test HTTPS connection
curl -I https://workforcedemocracyproject.org

# Test WWW variants
curl -I http://www.workforcedemocracyproject.org
curl -I https://www.workforcedemocracyproject.org
```

Expected HTTP response: `301 Moved Permanently` (for HTTP to HTTPS redirect)
Expected HTTPS response: `200 OK` (once frontend is deployed)

## 3. SSL Certificate Verification

Check that the SSL certificate is properly installed and covers both domains:

```bash
# Check certificate details
echo | openssl s_client -connect workforcedemocracyproject.org:443 -servername workforcedemocracyproject.org 2>/dev/null | openssl x509 -noout -text | grep "Subject Alternative Name" -A 1

# Check certificate chain
openssl s_client -connect workforcedemocracyproject.org:443 -servername workforcedemocracyproject.org -showcerts
```

The certificate should include both:
- `workforcedemocracyproject.org`
- `www.workforcedemocracyproject.org`

## 4. Nginx Configuration Check

Verify that the Nginx configuration is properly set up:

```bash
# Test Nginx configuration
nginx -t

# Check enabled sites
ls -la /etc/nginx/sites-enabled/

# View the configuration
cat /etc/nginx/sites-available/workforcedemocracyproject.org
```

## 5. Firewall and Port Availability

Ensure ports 80 and 443 are open:

```bash
# Check if ports are listening
netstat -tlnp | grep ':80\|:443'

# Check firewall rules (if ufw is used)
ufw status

# Check iptables rules (alternative firewall)
iptables -L
```

## 6. Service Status

Verify that all services are running properly:

```bash
# Check Nginx status
systemctl status nginx

# Check backend services
systemctl status wdp-backend-prod
systemctl status wdp-backend-beta
```

## 7. Log Analysis

Check relevant logs for errors:

```bash
# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Backend service logs
journalctl -u wdp-backend-prod -f
journalctl -u wdp-backend-beta -f
```

## 8. Certificate Renewal

If the certificate is expired or invalid:

```bash
# Renew certificate
certbot renew --dry-run

# If renewal fails, try obtaining a new certificate
certbot --nginx -d workforcedemocracyproject.org -d www.workforcedemocracyproject.org
```

## 9. HSTS Verification

Check that HSTS headers are properly set:

```bash
curl -I https://workforcedemocracyproject.org | grep -i strict
```

Should return:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 10. Content Security Policy Verification

Check that CSP headers are properly set:

```bash
curl -I https://workforcedemocracyproject.org | grep -i content-security
```

Should return the CSP header with allowances for required CDNs.

## Common Solutions

### If DNS is not resolving:
1. Wait for DNS propagation (can take up to 48 hours)
2. Clear local DNS cache:
   - Windows: `ipconfig /flushdns`
   - macOS: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl restart systemd-resolved`

### If certificate issues persist:
1. Check that both domains are included in certificate request
2. Ensure Let's Encrypt can access the ACME challenge endpoint
3. Verify that no conflicting Nginx configurations exist

### If Nginx configuration fails:
1. Check for syntax errors in configuration files
2. Ensure all file paths exist and are accessible
3. Verify that no duplicate server blocks exist for the same domain

### If service won't start:
1. Check service logs for specific error messages
2. Verify that ports are not already in use
3. Ensure all required dependencies are installed