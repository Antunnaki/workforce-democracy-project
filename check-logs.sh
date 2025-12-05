#!/bin/bash
# Check what's happening with the AI service

cat > /tmp/check-logs.sh << 'EOF'
#!/bin/bash

echo "=== PM2 STATUS ==="
pm2 status

echo ""
echo "=== LAST 50 LINES OF BACKEND LOGS ==="
pm2 logs backend --lines 50 --nostream

echo ""
echo "=== CHECKING FOR ITERATIVE SEARCH LOGS ==="
pm2 logs backend --lines 200 --nostream | grep -E "Analyzing source gaps|Follow-up|Total sources after"

echo ""
echo "=== CHECKING FOR ARTICLE SCRAPING LOGS ==="
pm2 logs backend --lines 200 --nostream | grep -E "Scraping full article|Scraped.*article|Cache stats"

echo ""
echo "=== CHECKING FOR SOURCE COUNTS ==="
pm2 logs backend --lines 200 --nostream | grep -E "Found.*sources|Providing.*sources to LLM"

EOF

chmod +x /tmp/check-logs.sh
bash /tmp/check-logs.sh
