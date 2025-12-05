#!/bin/bash
# Get the current civic-llm-async.js file from VPS
scp root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js \
    civic-llm-async-FROM-VPS.js

echo "✅ Downloaded civic-llm-async.js from VPS"
echo "File saved as: civic-llm-async-FROM-VPS.js"
