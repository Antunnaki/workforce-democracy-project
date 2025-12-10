# Project Guidelines

# Workforce Democracy Project — Junie Project Guidelines

Version: 2025-12-09

## Purpose
This document tells Junie how to explore, answer, and retrieve code/doc fragments in this repository quickly and safely. It also summarizes the project structure and the agreed workflows for development, testing, and deployment.

## Project overview
- Mission: Privacy-first civic platform providing representative info, bill tracking/analysis, and an empathy-forward AI assistant that always cites original sources.
- Current direction: Backend v2 on Scalingo (EU) with Postgres, OpenStates, and Qwen via DashScope; two environments (Production and Beta) for zero-downtime iteration.
- Legacy (v1): Njalla VPS + Nginx + PM2. Treat as historical; v2 is the target runtime.

## Key principles
- Privacy by default: no server-side storage of user PII; client history is encrypted locally.
- Original sources & citations: always link to the primary reporting/official records.
- Cost control: caching (client + server), short prompts, budgets.
- Ethical stack: avoid US big-tech data dependencies; prefer government APIs and community-funded outlets.

## Repository structure (known paths)
- Backend (legacy v1): `backend/`
    - `server.js` — Node/Express app (current v1 server)
    - `package.json` — scripts: `start`, `dev`, `test`, `lint`
- Frontend integration: `js/backend-api.js`
- AI/ops docs:
    - `AI_HANDOVER_COMPLETE.md` — comprehensive system doc (v1 state + issues)
    - `.aiassistant/rules/` — assistant rules and deployment notes
- Junie guidelines: `.junie/guidelines.md` (this file)

Note: As v2 is implemented, new folders will be added (e.g., `src/`, `scripts/`, `docs/`). Keep this guide updated.

## Environments and deployment
- Target platform: Scalingo (EU)
- Two apps (blue/green):
    - Production API: `wdp-api-prod` → `https://api.workforcedemocracyproject.org`
    - Beta API: `wdp-api-beta` → `https://api-beta.workforcedemocracyproject.org`
- Branch strategy:
    - `main` → deploys to Production
    - `beta` → deploys to Beta
    - Feature branches → PRs → merge into `beta` → test on Beta → merge to `main`
- Env vars (per app):
    - `NODE_ENV=production`
    - `DATABASE_URL` (Scalingo Postgres add-on injects this)
    - `OPENSTATES_API_KEY`
    - `DASHSCOPE_API_KEY`
    - `ALLOWED_ORIGINS=https://workforcedemocracyproject.netlify.app,https://workforcedemocracyproject.org,https://www.workforcedemocracyproject.org`
    - `CHAT_DAILY_BUDGET` (e.g., 100; adjustable later)
    - `LLM_MAX_TOKENS=512`
    - `LLM_TIMEOUT_MS=20000`
    - `MODE=production|beta` (loads the correct LLM prompt/policy)
- Scheduler tasks (optional):
    - `node scripts/poll-feeds.js` every 15 min (RSS/API ingest with ETag/Last-Modified)
    - `node scripts/ingest-gov.js --since=1d` nightly (OpenStates, etc.)

## Data sources and caching
- Government APIs: OpenStates (state), Congress.gov / FederalRegister (federal), plus per-country adapters (for AU, CA, UK, IE, DE, FR, MX) in the rollout.
- News sources: curated allowlist with trust tiers (community-funded trusted > verified public/academic > establishment as verification; billionaire-owned marked caution). Always cite original reporting.
- Persistence: Settled bills are persisted indefinitely; AI generic answers get short TTL (24–72h) in server cache; feeds use conditional requests.

## Security and privacy policy (operational)
- Do NOT commit private keys, tokens, or `.env` files.
- PII: avoid collecting or persisting personal identifiers. Logs are redacted; IPs hashed with a rotating salt; retention ≤ 30 days.
- CORS: only the three allowed origins listed in env.
- Licensing: backend code under AGPL-3.0-or-later (planned); docs under CC BY-SA 4.0; brand assets reserved.

## How Junie should work in this repo
- Retrieval
    - Prefer `search_project` for short literal strings (file or symbol names).
    - Use `get_file_structure` to understand large files before opening sections.
    - Use `open` to fetch specific lines; avoid opening entire files unless necessary.
- Testing and building
    - Backend v1: `npm install` then `npm test` and `npm run lint`. For dev: `npm run dev`.
    - v2 (as it lands): follow `docs/DEPLOYMENT.md` and `docs/DATA_INGESTION.md` (to be added).
- Changes and proposals
    - Junie provides diffs/patches or code blocks; maintainers apply them via Git. Junie does not commit or run interactive shells in production.
- Safety checks
    - Never print or store secrets.
    - For migrations, provide idempotent SQL and a rollback note.

## Code style
- JavaScript/Node 18+ (prefer Node 20 LTS for v2)
- ESLint + Prettier (where configured); prefer small pure functions and explicit error handling.
- Use `zod` (or similar) for input validation in v2.

## Issue triage and memory
- Keep `AI_HANDOVER_COMPLETE.md` updated after major changes.
- Add or amend docs in `docs/` (e.g., `DEPLOYMENT.md`, `LLM_POLICY.md`, `DATA_INGESTION.md`).
- Record key decisions (privacy, sources, budgets) so future assistants can continue seamlessly.

## Contact points
- Scalingo dashboards for Prod/Beta
- GitHub repo: PRs with reviews required for `main`
- Netlify for frontend deploys
