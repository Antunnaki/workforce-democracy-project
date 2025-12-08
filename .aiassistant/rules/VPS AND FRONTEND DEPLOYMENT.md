---
apply: always
---

Purpose
You asked for a single, copy‑pasteable set of instructions (extracted and consolidated from your docs) that Lingma can use to SSH into your VPS to review, edit, and deploy — plus the Git/Netlify frontend deployment workflow. Below is the streamlined playbook with exact commands and paths, citing where they come from in your repo.

What Lingma needs from you (prerequisites)
VPS IP and user: root@185.193.126.13 (from VPS-ACCESS-AND-PROJECT-STRUCTURE.md and multiple deploy docs)
SSH key-based access enabled (recommended; disable password logins if possible)
Process manager in use: PM2 (primary), with some systemd service names also present in older docs
Key server paths:
Frontend (served by Nginx): /var/www/html/
Backend (Node/Express): commonly /var/www/workforce-democracy/backend/ and/or /var/www/workforce-backend/ (both appear in docs)
AI service files: /var/www/workforce-democracy/backend/ai-service*.js
PM2 binary: /opt/nodejs/bin/pm2
Sources: VPS-ACCESS-AND-PROJECT-STRUCTURE.md, EASY-VPS-UPLOAD-INSTRUCTIONS.md, VPS-DEPLOYMENT-COMMANDS.sh, various “🚀-DEPLOY-*.md` files.

1) SSH into the VPS
   From your local terminal:
   ssh root@185.193.126.13 -p 22
   Source: EASY-VPS-UPLOAD-INSTRUCTIONS.md.

If first time, add host to known_hosts. Prefer SSH keys over passwords.

2) Quick server diagnostics (run right after login)
   Use this to verify paths, processes, and environment quickly.

echo "=== VPS DIAGNOSTIC INFO ===" && \
echo "Hostname: $(hostname)" && \
echo "User: $(whoami)" && \
echo "Current Dir: $(pwd)" && \
echo "OS: $(grep PRETTY_NAME /etc/os-release)" && \
echo "\n=== PM2 STATUS ===" && \
/opt/nodejs/bin/pm2 list && \
echo "\n=== FRONTEND CHECK ===" && \
ls -la /var/www/html/ | grep -E "index.html|^d.*js|^d.*css" && \
echo "\n=== BACKEND CHECK ===" && \
ls -la /var/www/workforce-democracy/backend/ | grep -E "server.js|.env" && \
echo "\n=== ALT BACKEND (if present) ===" && \
ls -la /var/www/workforce-backend/ | grep -E "server.js|.env" || true
Source: adapted directly from VPS-ACCESS-AND-PROJECT-STRUCTURE.md.

Tip: If PM2 shows multiple apps (e.g., version A/B on ports 3000/3001), note their names for restarts.

3) Review/edit backend code safely
   A. Make a backup, then edit in place (nano):

cd /var/www/workforce-democracy/backend
cp server.js server.js.backup.$(date +%F-%H%M)
nano server.js
Source: EASY-VPS-UPLOAD-INSTRUCTIONS.md.

B. Replace/create a file via heredoc (useful for quick drops):

cat > /var/www/workforce-democracy/backend/ai-service-qwen.js << 'EOF'
[PASTE NEW CONTENT HERE]
EOF
Source: VPS-ACCESS-AND-PROJECT-STRUCTURE.md (frontend example adapted to backend path).

C. Upload from your Mac via scp:

# Replace local path and filename as needed
scp -P 22 \
"/path/to/local/file.js" \
root@185.193.126.13:/var/www/workforce-democracy/backend/file.js
Source: EASY-VPS-UPLOAD-INSTRUCTIONS.md.

Optional rsync (keeps perms/timestamps):

rsync -avz -e "ssh -p 22" ./backend/ \
root@185.193.126.13:/var/www/workforce-democracy/backend/
D. Set safe permissions when replacing critical files:

chown www-data:www-data /var/www/workforce-democracy/backend/server.js
chmod 644 /var/www/workforce-democracy/backend/server.js
Source: VPS-DEPLOYMENT-COMMANDS.sh.

4) Restart backend and tail logs
   Primary (PM2):

/opt/nodejs/bin/pm2 list
/opt/nodejs/bin/pm2 restart <APP_NAME_OR_ID>
/opt/nodejs/bin/pm2 logs <APP_NAME_OR_ID> --lines 30
Common patterns in your docs:

Single app as ID 0: /opt/nodejs/bin/pm2 restart 0
Named apps: workforce-democracy-a, workforce-democracy-b, or workforce-democracy-backend Sources: EASY-VPS-UPLOAD-INSTRUCTIONS.md, QWEN_MIGRATION_AND_FIX.md, VPS-DEPLOYMENT-COMMANDS.sh.
Alternate (systemd) if present in older setups:

systemctl status workforce-backend-a.service
systemctl restart workforce-backend-a.service
systemctl status workforce-backend-b.service
Source: many 🚀-DEPLOY-*.md docs showed systemctl usage.

Expected healthy log lines after restart (examples from your docs):

🏛️ Civic Platform API initialized
Server running on port 3000/3001
5) Verify backend health and chat
   Health check (public):

curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | python3 -m json.tool
Source: QWEN_MIGRATION_AND_FIX.md, VPS-DEPLOYMENT-COMMANDS.sh.

Direct chat test:

curl -s -X POST \
"https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
-H "Content-Type: application/json" \
-d '{"message": "Hello, who are you?"}' | python3 -m json.tool
Source: QWEN_MIGRATION_AND_FIX.md.

If using local ports for internal checks (adjust per PM2 app):

curl -s http://localhost:3000/api/civic/llm-health | python3 -m json.tool || true
curl -s http://localhost:3001/api/civic/llm-health | python3 -m json.tool || true
Environment note (Qwen): ensure .env has QWEN_API_KEY and QWEN_MODEL=qwen-plus (from QWEN_MIGRATION_AND_FIX.md).

6) Frontend on the VPS (rare; usually Netlify)
   Your Nginx root is /var/www/html/. To inspect or hotfix:

ls -la /var/www/html/
# Example: view/change a line in index.html
sed -n '3500,3560p' /var/www/html/index.html | nl
cp /var/www/html/index.html /var/www/html/index.html.backup.$(date +%s)
nano /var/www/html/index.html
Source: VPS-ACCESS-AND-PROJECT-STRUCTURE.md.

But the canonical workflow for frontend is Git → Netlify (next section).

7) Git/Netlify frontend deployment (preferred)
   Option A — Drag & Drop (easiest):

Go to https://app.netlify.com → your site → Deploys tab
Drag your project folder to the drop zone → wait for “Published” Source: NETLIFY-DEPLOYMENT-CHECKLIST.md.
Option B — Git push (auto‑deploy):

# from your local repo working copy
git add js/backend-api.js js/inline-civic-chat.js js/bills-chat.js js/ethical-business-chat.js index.html
git commit -m "Frontend update: backend integration and fixes"
git push origin main
Source: NETLIFY-DEPLOYMENT-CHECKLIST.md.

CDN cache busting (if changes don’t appear):

Netlify UI: Deploys → “Trigger deploy” → “Clear cache and deploy site”
Append a cache-busting querystring to script URLs in index.html, e.g.:
<script src="js/markdown-renderer.js?v=36.11.12&t=1706123456"></script>
Or rename the asset (e.g., markdown-renderer-v2.js) and update the reference. Source: 🔥-NETLIFY-QUICK-FIX.md.
Post‑deploy checks:

Open the site, inspect console for integration logs
Hit backend health: https://api.workforcedemocracyproject.org/api/civic/llm-health Sources: NETLIFY-DEPLOYMENT-CHECKLIST.md.
Security reminder: Do NOT commit .env or secrets to Git. Backend secrets live only on the VPS in /var/www/.../backend/.env.

8) Common upload/rollback patterns
   Upload single file from Mac:

scp -P 22 \
"/local/path/server.js" \
root@185.193.126.13:/var/www/workforce-democracy/backend/server.js
Quick rollback:

cd /var/www/workforce-democracy/backend
cp server.js.backup.YYYY-MM-DD-HHMM server.js
/opt/nodejs/bin/pm2 restart <APP_NAME_OR_ID>
Sources: EASY-VPS-UPLOAD-INSTRUCTIONS.md, VPS-DEPLOYMENT-COMMANDS.sh.

9) If direct SSH by an assistant is not permitted
   Have the human operator run the same commands. You also have ready‑made server‑side scripts you can execute once logged in, such as:

bash "/var/www/workforce-democracy/backend/VERIFY-v37.5.0-COMPLETE.sh"  # example, if present
Or use the provided “run on server directly” wrapper:

bash "/var/www/workforce-democracy/backend/../🚀-RUN-ON-SERVER-DIRECTLY.sh"  # path may vary
Source: 🚀-RUN-ON-SERVER-DIRECTLY.sh and numerous VERIFY-*.sh helpers.

If you want a one‑paste diagnostics block for the operator, reuse the diagnostics in section 2.

10) Quick reference of key paths and commands (from your docs)
    Frontend root: /var/www/html/ (Nginx)
    Backend roots: /var/www/workforce-democracy/backend/ and /var/www/workforce-backend/ (both appear)
    PM2 binary: /opt/nodejs/bin/pm2
    Restart: /opt/nodejs/bin/pm2 restart <name-or-id>
    Logs: /opt/nodejs/bin/pm2 logs <name-or-id> --lines 50
    Health: curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health
    Chat: curl -s -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat -H "Content-Type: application/json" -d '{"message":"hi"}'
    Sources used (for your audit trail)
    /VPS-ACCESS-AND-PROJECT-STRUCTURE.md
    /EASY-VPS-UPLOAD-INSTRUCTIONS.md
    /VPS-DEPLOYMENT-COMMANDS.sh
    /QWEN_MIGRATION_AND_FIX.md
    /NETLIFY-DEPLOYMENT-CHECKLIST.md
    /🔥-NETLIFY-QUICK-FIX.md
    Plus multiple 🚀-DEPLOY-*.md files showing systemctl variants
    If you want, I can tailor these commands to your exact PM2 app names (A/B) after you paste the output of /opt/nodejs/bin/pm2 list from your server.