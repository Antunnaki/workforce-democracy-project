# 🇦🇺 Australian Government Data APIs - Research

**Date**: January 31, 2025  
**Purpose**: Investigate Australian government APIs for parliamentary data, representatives, voting records  
**Privacy Focus**: Open government data, no Big Tech dependencies  

---

## 🔍 Research Targets

### Australian Parliamentary Data Sources

1. **Australian Parliament House**
   - Official government source
   - Parliamentary data, Hansard records
   - Member information

2. **Australian Electoral Commission (AEC)**
   - Electoral data
   - Candidate information
   - Voting results

3. **Open Government Data**
   - data.gov.au
   - Parliamentary APIs
   - Public datasets

---

## 🌐 Known Australian Government Data Sources

### 1. Parliament of Australia - APH Data

**Website**: https://www.aph.gov.au/  
**Data Portal**: https://data.aph.gov.au/

**Potential Data**:
- Members of Parliament (MPs)
- Senate members
- Hansard (parliamentary debates)
- Committee data
- Voting records
- Bills and legislation

### 2. Australian Electoral Commission (AEC)

**Website**: https://www.aec.gov.au/  
**Data**: https://results.aec.gov.au/

**Provides**:
- Electoral boundaries
- Candidate information
- Election results
- Polling place data

### 3. Data.gov.au - Open Government Data

**Website**: https://data.gov.au/  
**Type**: Open data platform

**Search Terms**:
- "parliament"
- "electoral"
- "members of parliament"
- "voting records"
- "hansard"

### 4. OpenAustralia.org

**Website**: https://www.openaustralia.org.au/  
**Type**: Non-government parliamentary monitoring project

**Features**:
- Makes parliament more accessible
- Tracks MPs and Senators
- Voting records
- Hansard search
- Email alerts for topics

**API**: May have API access

### 5. They Vote For You

**Website**: https://theyvoteforyou.org.au/  
**Type**: Non-government voting tracker

**Features**:
- Division (vote) records
- How MPs/Senators voted
- Policy positions based on votes
- Comparison tools

**Potential API**: Check if they offer data access

---

## 🔎 Next Steps for Research

### Immediate Actions
1. Check if OpenAustralia.org has a public API
2. Investigate data.gov.au parliamentary datasets
3. Look for Australian Parliament House API documentation
4. Check They Vote For You for data access options
5. Research state-level parliamentary data (NSW, VIC, QLD, etc.)

### Questions to Answer
- [ ] Is there an official Parliament of Australia API?
- [ ] Does OpenAustralia.org provide API access?
- [ ] What data formats are available? (JSON, XML, CSV)
- [ ] Are APIs free and open? (No API keys required?)
- [ ] What's the update frequency?
- [ ] Do they have CORS enabled for browser access?

---

## 📊 Privacy Assessment Criteria

For any Australian API we consider:

✅ **GOOD - Use These**:
- Official government open data
- No API key required
- No user tracking
- Public domain data
- CORS-enabled for browser access

⚠️ **CAUTION - Review Carefully**:
- Requires API key (check terms)
- Rate limits (reasonable?)
- Data usage restrictions

❌ **AVOID - Don't Use**:
- Big Tech platforms (Google, Facebook, Microsoft)
- Requires user authentication
- Tracks queries or users
- Commercial data resellers
- Unclear privacy terms

---

## 🎯 Integration Goals

### What We Want for Australian Coverage

1. **Representative Information**
   - Federal MPs and Senators
   - State/territory MPs
   - Contact information
   - Electorate data

2. **Voting Records**
   - Division votes (how they voted on bills)
   - Policy positions
   - Attendance records

3. **Legislative Data**
   - Bills and acts
   - Committee inquiries
   - Hansard records

4. **Electoral Information**
   - Candidates
   - Election results
   - Electoral boundaries

---

## 🔧 Technical Requirements

### API Compatibility Checklist

- [ ] RESTful API or JSON endpoints
- [ ] CORS-enabled (or backend proxy acceptable)
- [ ] Free access (no paid tiers)
- [ ] Reasonable rate limits
- [ ] Documentation available
- [ ] Active/maintained
- [ ] Privacy-respecting

---

## 📝 Research Status

**Status**: 🔄 **In Progress** - Researching available APIs

**Priority Sources**:
1. OpenAustralia.org (likely has API)
2. data.gov.au (open government data)
3. Parliament House official APIs
4. They Vote For You (voting records)

**Next**: Investigate each source for API availability and privacy terms

---

*This research will inform whether Australian parliamentary data can be integrated into Workforce Democracy Project using privacy-respecting, open government sources.*
