# Credits & Cost Control Guidelines (Default Rules)

Purpose: Keep AI costs predictable while preserving quality. Assistants (Lingma, Junie, others) MUST follow these rules by default unless the user explicitly opts out.

Last Updated: 2025-12-08

---

## 1) Model, Provider, and Routing
- Prefer the smallest model that meets quality needs; escalate only when required by the task.
- Batch lightweight checks locally (regex/JS) before invoking LLMs.
- Cache stable prompts/system messages in-memory where safe.

## 2) Request Budgeting
- Cap tokens per request; aim for concise prompts/results.
- Use streaming for long responses; avoid re-asking unchanged questions.
- Limit retries to 1–2 with exponential backoff; log why a retry happened.

## 3) Caching and Reuse
- Reuse prior results for identical inputs (hash inputs → cache key). Store short-lived caches in memory or local store.
- Persist long-running fetches (e.g., article indexing) and re-use enriched data to avoid repeated LLM calls.

## 4) Offloading & Precomputation
- Pre-index articles and metadata (scraper + seeder) so chat can cite without live-heavy LLM searching.
- Keep enrichment pipelines incremental: only process deltas.

## 5) Guardrails for Expensive Ops
- Refuse or summarize extremely broad requests; suggest narrowing scope.
- For bulk jobs, do chunked processing with progress checkpoints.
- Fail-fast on invalid inputs (missing zip, empty query, etc.).

## 6) Logging & PII
- Log minimal info (status, counts, durations); never store full prompts with PII.
- Redact API keys and secrets from logs entirely.

## 7) Observability
- Emit per-request metrics: duration, tokens_in/out (if available), model, provider, cache hit/miss.
- Nightly/weekly report: total requests, cache hit rate, average tokens, retried count.

## 8) Feature Flags & Safe Defaults
- Default to Qwen with strict citation mode on.
- Fall back to non-LLM flows (MongoDB/search index) whenever possible.
- Keep Version B (staging) on cost-saver configs to validate changes before promoting.

## 9) Operational Policy
- All assistants must read `OPERATIONS_HANDOVER.md` first.
- Never change PM2 names/ports or Nginx routes without updating docs.
- For emergency fixes, apply to Version B first; verify; then promote to Version A.

## 10) Practical Tips
- Prefer smaller, more frequent deploys to reduce rollback blast radius.
- When a chat gets long, write a short session summary and reference it in prompts to preserve context without reprocessing the entire history.

---

See also: `OPERATIONS_HANDOVER.md` (environments, deploy, verify), `ops-memory.json` (machine-readable state).