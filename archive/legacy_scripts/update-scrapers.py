#!/usr/bin/env python3
"""
Update article-scraper.js with improved selectors based on diagnostic results
This script will be customized after running test-scrapers.js
"""

import re
import sys

# Read scraper test results
print("📊 Reading scraper diagnostic results...")
try:
    with open('/tmp/scraper-test-results.txt', 'r') as f:
        results = f.read()
except FileNotFoundError:
    print("❌ Scraper test results not found. Run test-scrapers.js first!")
    sys.exit(1)

# Parse results to find recommended selectors
recommendations = {}

# Extract recommendations for each site
sites = {
    'Common Dreams': 'scrapeCommonDreams',
    'Democracy Now': 'scrapeDemocracyNow',
    'Jacobin': 'scrapeJacobin',
    'The Intercept': 'scrapeTheIntercept',
    'ProPublica': 'scrapeProPublica'
}

for site_name, function_name in sites.items():
    # Find the section for this site
    site_section = re.search(
        rf'TESTING: {site_name}.*?(?=TESTING:|DIAGNOSTIC COMPLETE)',
        results,
        re.DOTALL
    )
    
    if site_section:
        section_text = site_section.group(0)
        
        # Look for recommended selector
        recommended = re.search(r'RECOMMENDED: "([^"]+)"', section_text)
        
        if recommended:
            selector = recommended.group(1)
            recommendations[site_name] = selector
            print(f"✅ {site_name}: {selector}")
        else:
            print(f"⚠️  {site_name}: No working selector found")

if not recommendations:
    print("\n❌ No recommendations found in test results")
    print("This might mean:")
    print("  1. Scraper tests haven't been run yet")
    print("  2. All sites are JavaScript-rendered (need different approach)")
    print("  3. Test results file is malformed")
    sys.exit(1)

print(f"\n✅ Found {len(recommendations)} recommended selector(s)")

# Read article-scraper.js
with open('/root/progressive-policy-assistant/backend/article-scraper.js', 'r') as f:
    scraper_content = f.read()

# Update each scraper function with new selectors
updates_made = 0

for site_name, new_selector in recommendations.items():
    function_name = sites[site_name]
    
    # Find the function
    function_match = re.search(
        rf'(async function {function_name}\([^)]*\)\s*\{{.*?const selectors = \[)(.*?)(\];)',
        scraper_content,
        re.DOTALL
    )
    
    if function_match:
        # Check if new selector is already first in list
        old_selectors = function_match.group(2)
        
        if new_selector in old_selectors:
            print(f"ℹ️  {site_name}: Selector already present")
            continue
        
        # Add new selector as first option
        new_selectors = f"\n        '{new_selector}',{function_match.group(2)}"
        
        old_function = function_match.group(0)
        new_function = function_match.group(1) + new_selectors + function_match.group(3)
        
        scraper_content = scraper_content.replace(old_function, new_function)
        updates_made += 1
        print(f"✅ Updated {site_name} scraper")

if updates_made > 0:
    # Write back
    with open('/root/progressive-policy-assistant/backend/article-scraper.js', 'w') as f:
        f.write(scraper_content)
    
    print(f"\n✅ Successfully updated {updates_made} scraper(s)")
    print("\n⚠️  IMPORTANT: Restart backend to apply changes:")
    print("   pm2 stop backend && pm2 delete backend && pkill -9 node && pm2 start server.js --name backend")
else:
    print("\n✅ All scrapers already have recommended selectors")

# Show summary
print("\n" + "="*80)
print("📊 SCRAPER UPDATE SUMMARY")
print("="*80)

for site_name, selector in recommendations.items():
    print(f"\n{site_name}:")
    print(f"  Recommended: {selector}")
    
    # Check if it's in the file
    if selector in scraper_content:
        print(f"  Status: ✅ Present in scraper")
    else:
        print(f"  Status: ⚠️  Not added (check function pattern)")

print("\n" + "="*80)
