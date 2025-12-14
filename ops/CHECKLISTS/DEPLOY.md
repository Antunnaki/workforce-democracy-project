# Deploy checklist (beta and prod)

- [ ] Local: `package-lock.json` committed; Node 18/20 used.
- [ ] Server: Node 20 preferred; npm ci used for installs.
- [ ] Create release dir `/srv/wdp/releases/<timestamp>`.
- [ ] `rsync -azv --delete` with excludes (`.git`, `node_modules`, `.idea`, `*.iml`, `.DS_Store`).
- [ ] `npm ci --omit=dev --no-audit --no-fund` inside release.
- [ ] `ln -sfn <release> /srv/wdp/current-<env>`.
- [ ] `sudo systemctl restart wdp-backend-<env>`; verify status/logs.
- [ ] Stamp `version.json` (commit + timestamp).
- [ ] Smoke test HTTP(S) endpoint; if beta, ensure TLS is valid.