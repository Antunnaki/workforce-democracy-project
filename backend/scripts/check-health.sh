#!/usr/bin/env bash
set -euo pipefail
BASE="${1:?Usage: $0 https://api.example.org}"
curl -fsSL "$BASE/health" | sed -n '1,200p'