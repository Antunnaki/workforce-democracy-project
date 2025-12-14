#!/bin/bash

# Comprehensive health check script for Workforce Democracy Project production API
DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
HEALTH_ENDPOINT="https://api.workforcedemocracyproject.org/health"
LOG_FILE="/var/log/wdp-prod-comprehensive-health.log"

# Check health endpoint
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT")

if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "$DATE - OK: Health check passed (HTTP $HEALTH_STATUS)" >> "$LOG_FILE"
else
    echo "$DATE - ERROR: Health check failed (HTTP $HEALTH_STATUS)" >> "$LOG_FILE"
fi
