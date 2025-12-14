# Runbook — Enable HTTPS for beta

### Preconditions
- DNS for `api-beta.workforcedemocracyproject.org` has A+AAAA pointing to the server.
- Nginx has IPv4+IPv6 HTTP listeners (`listen 80;` and `listen [::]:80;`) for the beta hostname.
- App is listening on `127.0.0.1:3001` (via `PORT=3001`).

### Steps (requires sudo)
1) Issue the certificate (preferred nginx installer):
   ```bash
   sudo certbot --nginx -d api-beta.workforcedemocracyproject.org
   ```
   Fallback if installer can't find a matching block yet:
   ```bash
   sudo certbot certonly --webroot -w /var/www/html -d api-beta.workforcedemocracyproject.org
   ```
2) Ensure HTTPS vhost proxies to `127.0.0.1:3001` and has IPv6 listeners (template in `ops/TEMPLATES/nginx_beta.conf`).
3) Test and reload Nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Verify
```bash
sudo certbot certificates | sed -n '1,200p'
curl -sSI http://api-beta.workforcedemocracyproject.org | head -n1
curl -sSI https://api-beta.workforcedemocracyproject.org | head -n1
openssl s_client -connect api-beta.workforcedemocracyproject.org:443 -servername api-beta.workforcedemocracyproject.org -brief </dev/null | sed -n '1,15p'
```

### Renewal
- Confirm timer: `systemctl list-timers | grep -i certbot || true`
- Dry-run renewal: `sudo certbot renew --dry-run`

### Optional: allow `deploy` to manage certs/reloads without password
- Install constrained sudoers file from `ops/TEMPLATES/sudoers_wdp-deploy-tls` via `visudo`.
- Verify: `sudo -n nginx -t` and `sudo -n certbot renew --dry-run` return without prompts.