#!/bin/bash

# Comprehensive health check script for Workforce Democracy Project production API
DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
HEALTH_ENDPOINT="https://api.workforcedemocracyproject.org/health"
MAIN_SITE_ENDPOINT="https://workforcedemocracyproject.org/"
WWW_SITE_ENDPOINT="https://www.workforcedemocracyproject.org/"
LOG_FILE="/var/log/wdp-prod-comprehensive-health.log"

# Check API health endpoint
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT")

if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "$DATE - OK: API health check passed (HTTP $HEALTH_STATUS)" >> "$LOG_FILE"
else
    echo "$DATE - ERROR: API health check failed (HTTP $HEALTH_STATUS)" >> "$LOG_FILE"
fi

# Check main site endpoint
MAIN_SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_SITE_ENDPOINT")

if [ "$MAIN_SITE_STATUS" -eq 200 ]; then
    echo "$DATE - OK: Main site check passed (HTTP $MAIN_SITE_STATUS)" >> "$LOG_FILE"
else
    echo "$DATE - ERROR: Main site check failed (HTTP $MAIN_SITE_STATUS)" >> "$LOG_FILE"
fi

# Check www site endpoint
WWW_SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WWW_SITE_ENDPOINT")

if [ "$WWW_SITE_STATUS" -eq 200 ]; then
    echo "$DATE - OK: WWW site check passed (HTTP $WWW_SITE_STATUS)" >> "$LOG_FILE"
else
    echo "$DATE - ERROR: WWW site check failed (HTTP $WWW_SITE_STATUS)" >> "$LOG_FILE"
fi