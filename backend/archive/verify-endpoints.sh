#!/bin/bash
# Script to verify backend endpoints are working correctly

echo "🔍 Verifying backend endpoints..."

# Test health endpoint
echo "🩺 Testing health endpoint..."
curl -I http://localhost:3001/health

# Test nonprofit proxy endpoint
echo "🤝 Testing nonprofit proxy endpoint..."
curl -I 'http://localhost:3001/api/nonprofits/search?q=employment%20services'

# Test representatives endpoint
echo "🏛️ Testing representatives endpoint..."
curl -sS 'http://localhost:3001/api/civic/representatives/search?zip=12061' | head -n 10

echo "✅ Endpoint verification completed"