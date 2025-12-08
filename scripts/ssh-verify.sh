#!/usr/bin/env bash
set -euo pipefail

# SSH Connectivity & Env Diagnostics (Non‑destructive)
# Usage: bash scripts/ssh-verify.sh <user> <host> [backend_path]
# Example: bash scripts/ssh-verify.sh root 185.193.126.13 /var/www/workforce-democracy/backend

if [[ ${1:-} == "-h" || ${1:-} == "--help" || $# -lt 2 ]]; then
  echo "Usage: $0 <user> <host> [backend_path]"
  exit 0
fi

USER="$1"
HOST="$2"
BACKEND_PATH="${3:-/var/www/workforce-democracy/backend}"

echo "--- BASIC INFO ---"
echo "Local: $(whoami)@$(hostname -f)"
echo "Target: ${USER}@${HOST}"

echo "--- DNS/ICMP ---"
if command -v getent >/dev/null 2>&1; then
  getent hosts "$HOST" || true
fi
ping -c 1 -t 2 "$HOST" || echo "(ping failed or filtered)"

echo "--- SSH PORT (22) ---"
if command -v nc >/dev/null 2>&1; then
  nc -vz -w 3 "$HOST" 22 || echo "(TCP 22 closed or filtered)"
else
  (ss -tn | grep ":22" >/dev/null 2>&1 || true)
fi

echo "--- SSH VERBOSE PROBE (8s timeout) ---"
ssh -vv -o PreferredAuthentications=password \
        -o PubkeyAuthentication=no \
        -o ConnectTimeout=8 \
        -o StrictHostKeyChecking=accept-new \
        "${USER}@${HOST}" exit 0 || echo "(SSH verbose probe did not complete)"

echo "--- REMOTE QUICK CHECKS (non‑interactive) ---"
ssh -o BatchMode=yes -o ConnectTimeout=5 "${USER}@${HOST}" \
  "whoami; hostname -f; command -v pm2 || true; node -v || true; npm -v || true" \
  || echo "(BatchMode check requires key auth; skipped)"

echo "--- PATH CHECK (may require auth) ---"
ssh -o ConnectTimeout=8 "${USER}@${HOST}" "[ -d '${BACKEND_PATH}' ] && echo 'Found: ${BACKEND_PATH}' && ls -la '${BACKEND_PATH}' | head -n 20 || echo 'Path not found'" || true

cat <<'TIPS'
--- TIPS IF SSH HANGS BEFORE PASSWORD ---
1) Check SSH daemon allows passwords (on VPS):
   - /etc/ssh/sshd_config → PasswordAuthentication yes
   - systemctl restart sshd
2) Firewall/Fail2ban:
   - ufw status
   - iptables -L -n
3) Prefer key auth: add your public key to /root/.ssh/authorized_keys
4) Add host key locally to avoid prompts:
   - ssh -o StrictHostKeyChecking=accept-new <user>@<host>
TIPS

echo "--- DONE ---"