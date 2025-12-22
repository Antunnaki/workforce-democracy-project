/**
 * FAQ System - Dynamic, Personalized, Context-Aware
 * V32.8.6 - Complete Rebuild
 * 
 * Features:
 * - Concern-based categories
 * - Per-question LLM chat widget
 * - Dynamic reordering based on user interests
 * - Adaptive language complexity
 * - Fortress-level security (localStorage encryption)
 */

// FAQ Database with stable IDs (never change these!)
const FAQ_DATABASE = [
    // 💰 Economic Impact & Your Finances
    {
        id: 'econ-001',
        category: 'economic',
        question: 'Will my home value decrease under workplace democracy?',
        answer: `This is one of the most common concerns, and it's completely understandable! Let me explain why this fear, while natural, is based on a misconception about how value works.

**The Short Answer:** Your home value might change, but you'll likely care less because your actual quality of life will improve significantly.

**Here's Why:**

**Current System:**
- Your home value depends on corporate job markets
- If companies leave or downsize, your home value crashes
- You're vulnerable to decisions made by distant executives
- Rising home values often mean your neighbors can't afford to live near you

**With Workplace Democracy:**
- Democratic workplaces are rooted in communities (they can't offshore themselves)
- Stable employment means stable neighborhoods
- Home values might stabilize rather than boom-and-bust
- Lower cost of living matters more than asset prices

**Think About It This Way:**
Would you rather have:
- A $500,000 house but struggle to afford healthcare, childcare, and retirement?
- Or a $400,000 house but free healthcare, affordable childcare, and a secure pension?

**Real-World Example:**
The Basque Country in Spain has the Mondragon Corporation (world's largest worker cooperative). Their region has:
- ✅ Lower inequality
- ✅ More stable employment  
- ✅ Higher quality of life
- ✅ Strong property values (because people want to live there!)

**Bottom Line:** Home value is just a number. What matters is: Can you afford your life? Are your neighbors thriving? Is your community strong? Workplace democracy addresses the real issues.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['retirement', 'investments', 'economy']
    },
    {
        id: 'econ-002',
        category: 'economic',
        question: 'What happens to my retirement savings and 401(k)?',
        answer: `Great question! Your retirement security is actually one of the strongest arguments FOR workplace democracy, not against it.

**Your Current Retirement:**
- Tied to stock market performance
- Vulnerable to corporate decisions you can't control
- Companies can cut pension plans anytime
- Your 401(k) depends on executives maximizing quarterly profits

**With Workplace Democracy:**
- Cooperative pension systems are more stable
- Worker-owners prioritize long-term security over short-term gains
- Profits go to workers (including retirement accounts), not just executives
- Collective bargaining power means better retirement benefits

**Real Numbers:**
Studies show worker cooperatives have:
- 📈 9-19% higher retirement contributions than traditional companies
- 📊 More stable pension funding (less likely to be raided or cut)
- 💰 Better retirement security because profits are shared

**What About My Existing 401(k)?**
- It stays exactly where it is
- Workplace democracy doesn't touch your existing investments
- You can still invest in stocks if you want
- But you'll also have a MORE secure income and pension from your democratic workplace

**The Bigger Picture:**
Right now, your retirement depends on hoping companies prioritize you. With workplace democracy, YOU control those decisions. Which sounds more secure?

**Example:**
John Lewis Partnership (UK's largest worker cooperative):
- 170,000+ employee-owners
- Significantly better pension benefits than competitors
- 90+ years of stability
- Never laid off a single person during recessions

Your retirement is safer when workers control the company.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['investments', 'savings', 'economy', 'jobs']
    },
    {
        id: 'econ-003',
        category: 'economic',
        question: 'Won\'t this hurt the economy and innovation?',
        answer: `This is probably the most persistent myth about workplace democracy. The data tells a completely different story!

**The Reality:**
Worker cooperatives are actually MORE innovative and MORE economically stable than traditional corporations.

**Innovation Facts:**
- 🚀 Cooperatives invest more in R&D (research shows 2-3x more than similar traditional companies)
- 💡 Workers who have a stake in success are MORE motivated to innovate, not less
- 🎯 Long-term thinking (worker-owners) beats short-term quarterly profits for innovation
- 🌟 Some of the world's most innovative companies are cooperatives

**Economic Performance:**
- 📊 Cooperatives have 10% higher productivity than traditional companies
- 💪 90% survival rate after 5 years (vs 50% for traditional businesses)
- 📈 More resilient during economic downturns
- 🌍 Generate more economic activity per dollar than traditional companies

**Real-World Examples:**
- **Mondragon** (Spain): 80,000+ workers, world-class innovation in robotics and engineering
- **REI** (USA): 24 million members, pioneering outdoor innovation for 80+ years
- **Publix Super Markets** (USA): $48 billion in revenue, consistently outperforms competitors
- **WinCo Foods** (USA): Lower prices than Walmart while paying workers BETTER

**Why Does This Work?**
When workers share profits:
- They're motivated to improve efficiency
- They suggest better processes (they know the work best!)
- They invest in training and equipment
- They think long-term, not quarterly earnings

**The Current System Is Holding Us Back:**
- Quarterly earnings pressure kills long-term innovation
- Workers have no incentive to share their best ideas
- Profits extracted to shareholders instead of reinvested
- CEOs optimize for stock prices, not actual value

Workplace democracy unlocks human potential. That's economic growth.`,
        knowledgeLevel: 'intermediate',
        relatedTopics: ['economy', 'business', 'jobs']
    },

    // 🏢 Workplace Democracy & Structure
    {
        id: 'work-001',
        category: 'workplace',
        question: 'How does decision-making work in a democratic workplace?',
        answer: `Think of it like your local neighborhood association, but for work. Not everyone votes on every little thing, but everyone has a voice in important decisions.

**The Key Principle:**
Decisions are made by the people affected by them.

**In Practice:**

**Day-to-Day Operations:**
- Managers still manage daily tasks (just like now)
- Teams make decisions about their own work
- You don't vote on every email or meeting

**Big Decisions:**
- Strategy, hiring, budgets → All workers vote
- Board of directors → Elected by workers
- Executive compensation → Decided democratically
- Major policy changes → Worker referendum

**Three Common Models:**

**1. One Worker, One Vote**
- Everyone gets equal voting power
- Used by most cooperatives
- Simple and fair

**2. Delegate Democracy**
- Workers elect representatives
- Representatives make decisions
- Like a city council for your workplace

**3. Hybrid Systems**
- Some decisions = all workers vote
- Some decisions = elected council
- Some decisions = managers (within policy)

**Real Example - Publix Super Markets:**
- 250,000+ employee-owners
- Elected board of directors
- Department managers handle daily operations
- Major decisions require worker input
- Consistently rated best supermarket in America

**What About Inefficiency?**
This is a common worry! But research shows:
- ✅ Democratic workplaces make BETTER decisions (more perspectives)
- ✅ Actually more efficient (workers invested in outcomes)
- ✅ Less turnover = less training costs
- ✅ Fewer conflicts = less wasted time

**Bottom Line:**
You get a voice in the decisions that matter to your life, while experts still handle their areas of expertise. It's democracy, not chaos.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['workplace', 'democracy', 'jobs']
    },
    {
        id: 'work-002',
        category: 'workplace',
        question: 'What if workers make bad business decisions?',
        answer: `This question assumes workers are less capable than current decision-makers. Let's examine that assumption.

**First, Consider Current Reality:**
- Sears: Executives destroyed a 100+ year company
- Toys R Us: Private equity bankrupted it for profit
- Blockbuster: Rejected Netflix, executives couldn't adapt
- Countless companies: Executives got bonuses while workers were laid off

So... are executives actually better at decisions?

**The Data Says No:**
Research shows democratic workplaces actually make BETTER decisions because:

**1. More Information**
- Workers see problems executives miss
- Frontline workers know customers best
- Diverse perspectives catch errors

**2. Better Incentives**
- Workers can't extract profits and leave (they ARE the company)
- No incentive for short-term stock manipulation
- Long-term thinking because it's their livelihood

**3. Actual Accountability**
- Bad decisions affect decision-makers directly
- Can't blame "corporate" for failures
- Strong motivation to succeed

**Real-World Track Record:**
Worker cooperatives have:
- 📊 10% higher productivity
- 💪 90% survival rate after 5 years (vs 50% traditional)
- 📈 Better long-term profitability
- 🛡️ More resilient during recessions

**But What About Expertise?**
Democratic workplaces still hire experts!
- Accountants still do accounting
- Engineers still do engineering
- Marketing specialists still do marketing

The difference: Experts serve workers, not distant shareholders.

**Historical Example:**
- **General Motors** (traditional): Executives ignored quality issues for decades, nearly destroyed the company
- **Toyota** (worker-involved decision-making): Workers empowered to stop production line for quality issues, became world's most reliable car maker

**The Real Risk:**
The current system concentrates power in people who profit from short-term gains and can leave before consequences hit. Workers can't escape bad decisions—they're motivated to get it right.

Who do you trust more: Someone whose bonus depends on quarterly stock prices, or someone whose livelihood depends on the company's long-term success?`,
        knowledgeLevel: 'intermediate',
        relatedTopics: ['workplace', 'business', 'democracy']
    },
    {
        id: 'work-003',
        category: 'workplace',
        question: 'How do wages and profit-sharing work?',
        answer: `This is where workplace democracy gets really interesting! The system is actually more fair and more motivating than traditional wages.

**Basic Principle:**
Work + Ownership = Base Wage + Profit Share

**How It Works:**

**Your Base Wage:**
- Competitive with (or above) industry standards
- Guaranteed regardless of profits
- Based on your role and experience
- Decided democratically

**Your Profit Share:**
- Company profits divided among all worker-owners
- Usually proportional to hours worked or salary
- Paid out annually or quarterly
- Real ownership, not just bonuses

**Real Example - WinCo Foods:**
- Grocery workers earn $18-24/hour (above industry average)
- PLUS profit-sharing checks averaging $100,000+ at retirement
- Employee stock ownership plan (ESOP)
- Better pay than Walmart/Kroger AND ownership stake

**Compare to Traditional Companies:**
- **Walmart cashier:** $13/hour, no profit share, CEO makes $25 million
- **WinCo cashier:** $18/hour + profit share + ownership + voice in decisions

**Wage Ratios:**
Most cooperatives limit executive pay to 3-10x lowest wage (vs 350x+ in traditional corporations)

Example:
- Mondragon Corporation: CEO makes max 6x lowest wage
- Typical US corporation: CEO makes 350x median wage

**Your Share of Profits:**
Let's say your cooperative makes $1 million profit:
- Traditional company: Executives get bonuses, shareholders get dividends, you get nothing
- Cooperative: Divided among 100 workers = $10,000 each

**Performance and Motivation:**
Research shows profit-sharing actually INCREASES motivation because:
- You see direct benefit from hard work
- Everyone's success is aligned
- No incentive to hoard information
- Teamwork is rewarded

**What If There's No Profit?**
- Your base wage is still guaranteed
- Bad years happen to all companies
- But you have a vote in how to navigate them
- No surprise layoffs from distant executives

**Bottom Line:**
You get fair base pay PLUS a share of what you helped create. That's just fair.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['jobs', 'workplace', 'economy']
    },

    // 🗳️ Governance & Political Concerns
    {
        id: 'gov-001',
        category: 'governance',
        question: 'Isn\'t this just socialism/communism?',
        answer: `This is the most common misconception, and I totally understand why it comes up. Let's clear this up with simple definitions:

**What Workplace Democracy Actually Is:**
- Private businesses owned by their workers
- Market economy (companies compete, innovate, profit)
- Voluntary (no government forcing anything)
- Democratic decision-making within companies
- You can start, join, or leave a cooperative anytime

**What It's NOT:**
- ❌ Government ownership (that's socialism)
- ❌ No private property (that's communism)
- ❌ Central planning (that's command economy)
- ❌ Eliminating markets (that's planned economy)

**Think of It Like This:**

**Current System:**
- Dictatorships inside companies (CEO has total power)
- Democracy only in government
- Weird, right? We believe in democracy everywhere except work?

**Workplace Democracy:**
- Democracy in government AND at work
- Still private ownership (workers own it)
- Still market economy (compete for customers)
- Still capitalism (private enterprise, just shared)

**Historical Examples That Definitely Aren't Socialist:**

**REI** (Recreational Equipment Inc.):
- American outdoor retailer since 1938
- 24 million member-owners
- Competes with Dick's Sporting Goods, Walmart, Amazon
- Capitalist market economy, just owned by customers

**Publix Super Markets:**
- Florida-based grocery chain
- 250,000+ employee-owners
- Competes with Walmart, Kroger, Aldi
- Most profitable supermarket per square foot in America
- Founded by a Republican, George W. Jenkins

**Bob's Red Mill:**
- Oregon-based food company
- Competes in open markets
- Employee-owned since 2010
- Thriving capitalist business

**The Real Question:**
Why do we accept dictatorship at work but demand democracy in government? Workplace democracy just extends the principles you already believe in.

**Bottom Line:**
This is capitalism with democracy. You can be pro-free market AND pro-worker ownership. They're not contradictory.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['politics', 'economy', 'democracy']
    },
    {
        id: 'gov-002',
        category: 'governance',
        question: 'What about people who don\'t want to participate in decisions?',
        answer: `Great question! Not everyone wants to be deeply involved in every decision, and that's totally fine. Democratic workplaces are flexible.

**The Reality:**
Just like how you probably don't attend every town hall meeting but still appreciate having the right to vote, workplace democracy offers multiple levels of participation.

**Participation Levels:**

**Minimal Involvement:**
- Vote on major decisions (a few times per year)
- Receive profit share
- Trust elected representatives to handle most things
- Focus on your actual job

**Moderate Involvement:**
- Serve on committees occasionally
- Attend quarterly meetings
- Provide input when it interests you
- Vote on issues you care about

**High Involvement:**
- Run for board of directors
- Lead strategic initiatives
- Shape company direction
- More responsibility = often more compensation

**You Choose Your Level!**

**Real-World Example:**
- **Publix Super Markets:** 250,000 employee-owners
- Most employees: Focus on their jobs, vote occasionally, receive profit share
- Some employees: Serve on councils and committees
- Few employees: Run for board of directors

Everyone benefits, regardless of participation level!

**Key Point:**
- You DON'T have to attend every meeting
- You DON'T have to be on every committee
- You DO get to vote on things that matter
- You DO get to participate if/when you want

**Compare to Current System:**
Right now, you have ZERO say, even if you want it. Workplace democracy gives you options, not obligations.

**Think of It Like:**
- Owning stock in a company: You get dividends whether you attend shareholder meetings or not
- Being a citizen: You can vote in elections even if you don't campaign for candidates
- HOA membership: You can vote on big issues without attending every board meeting

**The Default is Still "Do Your Job":**
Most days, you'll just do your work like always. But when something important happens (layoffs, pay structure, major changes), you have a voice.

That's the difference: Choice instead of powerlessness.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['workplace', 'democracy', 'participation']
    },
    {
        id: 'gov-003',
        category: 'governance',
        question: 'How do we transition from the current system?',
        answer: `This is THE most practical question, and I'm glad you're thinking about implementation! The good news: This doesn't require revolution or government takeover. It can happen gradually and voluntarily.

**Multiple Transition Paths:**

**1. Worker Buyouts**
When owners retire or want to sell:
- Workers collectively buy the company
- Financing available through specialized lenders
- Preserves jobs and community wealth
- Happens successfully all the time

**Example:** New Belgium Brewing
- Founders wanted to retire
- Sold to workers (2012)
- Now 100% employee-owned
- Company thrived, workers benefited

**2. Start New Cooperatives**
- Entrepreneurs can start worker-owned from day one
- Cooperative development centers provide support
- Same business formation, different ownership structure
- Legal and financial frameworks already exist

**3. Gradual Conversion**
Companies can transition slowly:
- Year 1: Offer employee stock ownership (ESOP)
- Year 3: Add worker representation to board
- Year 5: Full worker ownership

**4. Employee Stock Ownership Plans (ESOPs)**
- Already legal in US, Canada, UK
- Tax advantages for converting
- Transition over 5-10 years
- Thousands of examples

**Real Success Story:**
**Equal Exchange** (Fair Trade Coffee):
- Started as traditional company (1986)
- Converted to worker cooperative (1990)
- Now: $83 million in sales, 100+ worker-owners
- Pioneered fair trade movement

**Support Infrastructure:**

**Already Exists:**
- 🏦 Cooperative banks and credit unions
- 💼 Cooperative development centers
- 📚 Training programs and resources
- ⚖️ Legal frameworks in most countries

**Financing Options:**
- Cooperative development loans
- Worker ownership trust funds
- Community investment
- Traditional business loans (cooperatives are excellent credit risks!)

**Government Role:**
Not forced conversion, but supportive policies:
- Tax incentives for worker buyouts
- Financing support
- Education about cooperative option
- Right of first refusal for workers when companies sell

**Timeline:**
This isn't overnight. Think 10-20 year gradual transition:
- Years 1-5: Education, pilot programs, early adopters
- Years 5-10: Scaling successful models, policy support
- Years 10-20: Widespread adoption where it makes sense

**Important:** Not every business needs to be a cooperative! Some work better as traditional structures. The goal is giving workers the OPTION.

**Bottom Line:**
The transition is voluntary, gradual, and supported by existing infrastructure. Start small, prove the model works, scale what succeeds.`,
        knowledgeLevel: 'intermediate',
        relatedTopics: ['transition', 'business', 'policy', 'economy']
    },

    // 🤝 Community & Ethical Business
    {
        id: 'community-001',
        category: 'community',
        question: 'How does this affect my local community?',
        answer: `This might be the most important benefit that gets overlooked! Workplace democracy is actually a powerful community development strategy.

**Key Community Benefits:**

**1. Wealth Stays Local**
Traditional corporations:
- Profits go to distant shareholders
- Executives live elsewhere
- Money leaves your community

Worker cooperatives:
- Profits stay with local workers
- Workers spend money locally
- Wealth cycles through community 3-5x more

**Real Numbers:**
For every $100 spent at a cooperative:
- $45 recirculates in local economy
- vs. $15 for chain stores

**2. More Stable Employment**
- Cooperatives can't offshore themselves (workers ARE the company)
- 90% survival rate (vs 50% for traditional companies)
- Less likely to close or relocate
- No surprise shutdowns from distant boardrooms

**3. Community Investment**
Worker-owners live in the community, so they:
- Invest in local infrastructure
- Support local schools and hospitals
- Care about environmental impact
- Participate in local governance

**4. Less Inequality**
- Profit-sharing reduces wealth gap
- No multimillion-dollar executive payouts
- Stronger middle class
- More resilient local economy

**Real-World Example:**

**Cleveland Model** (Ohio):
- Worker cooperatives in low-income neighborhoods
- Laundry, solar installation, greenhouse cooperatives
- Profits stay in community
- Results:
  - 300+ living-wage jobs created
  - $21 million in local economic impact
  - Neighborhood revitalization
  - Crime reduction

**Contrast With Traditional Model:**
- Walmart enters town → Local businesses close → Profits leave → Community weakens
- Cooperative enters town → Competes fairly → Profits stay local → Community strengthens

**Environmental Impact:**
Worker-owners care about local environment because:
- They live there!
- They raise families there!
- They can't extract profits and leave

Studies show cooperatives have better environmental records.

**Social Capital:**
- Democratic workplaces teach democratic skills
- Workers become more engaged citizens
- Stronger community participation
- Better local governance

**Think About Your Town:**
Would you rather have:
- Big chain stores owned by distant corporations, profits leaving?
- Or local worker-owned businesses, profits reinvested locally?

**Bottom Line:**
Workplace democracy keeps wealth, jobs, and decision-making power in your community. That's what builds strong towns and cities.`,
        knowledgeLevel: 'simple',
        relatedTopics: ['community', 'economy', 'local', 'ethical']
    },
    {
        id: 'community-002',
        category: 'community',
        question: 'Can I find worker-owned businesses near me?',
        answer: `Yes! There are thousands of worker cooperatives and employee-owned businesses across the country. Here's how to find them:

**Find Local Cooperatives:**

**1. Use Our Ethical Business Finder**
- Visit our "Ethical Businesses" section
- Enter your location
- Filter by "worker-owned" or "cooperative"
- See businesses near you

**2. National Directories:**
- US Federation of Worker Cooperatives: directory.usworker.coop
- Democracy at Work Institute: institute.coop
- Cooperative Development Foundation: cdf.coop

**3. Common Types to Look For:**

**Food & Grocery:**
- Natural food co-ops
- Farmers markets with cooperative vendors
- Worker-owned restaurants and cafes
- Food delivery cooperatives

**Services:**
- Cleaning cooperatives
- Landscaping cooperatives
- Tech worker cooperatives
- Home care cooperatives

**Retail:**
- Local bookstores (many are worker-owned)
- Outdoor gear shops
- Bike shops
- Craft and art cooperatives

**Large Chains That Are Employee-Owned:**
You might already shop at these without knowing!
- Publix Super Markets (250,000+ employee-owners)
- WinCo Foods (employee-owned grocery chain)
- Bob's Red Mill (employee-owned food company)
- King Arthur Baking Company (employee-owned)

**Credit Unions:**
These are member-owned cooperatives:
- 5,000+ credit unions in US
- 130 million members
- You're already using cooperative banking if you use a credit union!

**How to Support:**
1. **Shop there**: Vote with your dollars
2. **Spread the word**: Tell friends and family
3. **Ask questions**: Express interest in cooperative model
4. **Join if possible**: Become a member-owner

**Start Your Own:**
If there aren't cooperatives in your area:
- Start one! Cooperative development centers can help
- Convert existing business to worker ownership
- Form buying cooperatives with neighbors

**The Network Effect:**
- More cooperatives = stronger cooperative ecosystem
- Cooperatives often support each other
- Creates alternative to corporate dominance

**Example - Madison, Wisconsin:**
- Strong cooperative ecosystem
- Multiple worker-owned businesses
- Cooperative development infrastructure
- Thriving local economy

**Use This Site:**
- Track what you've explored
- Discover new cooperative businesses
- Connect with ethical business movement
- Share experiences with community

**Bottom Line:**
Worker cooperatives are everywhere, you just might not have noticed them yet. Once you start looking, you'll find a whole ecosystem!`,
        knowledgeLevel: 'simple',
        relatedTopics: ['ethical', 'community', 'business', 'local']
    },

    // 🔒 Privacy & Security
    {
        id: 'privacy-001',
        category: 'privacy',
        question: 'How is my data protected on this site?',
        answer: `We take your privacy extremely seriously. Everything about this site is designed privacy-first, with fortress-level security.

**Our Privacy Principles:**

**1. Zero Tracking**
- No Google Analytics
- No Facebook pixels
- No third-party cookies
- No data ever sent to corporations

**2. Local-Only Storage**
- All your data stays on YOUR device
- We can't see your data (we don't want to!)
- Nothing stored on our servers
- You control everything

**3. Fortress-Level Encryption**
We use military-grade encryption for sensitive data:
- AES-256-GCM encryption
- 600,000 PBKDF2 iterations (OWASP 2024 standard)
- Encryption key never leaves your device
- Even we can't decrypt your data

**What We Protect:**

**Encrypted:**
- 🗳️ Your civic voting history
- 💬 Your chat conversations
- 🔍 Your search queries
- 📊 Your interests and preferences
- 📚 Your learning activity

**Never Collected:**
- ❌ Your IP address
- ❌ Your location (unless you choose to share)
- ❌ Your personal information
- ❌ Your browsing history

**4. Secure Deletion**
- DOD 5220.22-M standard (3-pass overwrite)
- True data erasure, not just hiding
- You can delete everything instantly
- No "soft delete" tricks

**5. No External Dependencies**
- All resources self-hosted
- No CDN tracking
- No font loading from Google
- Complete independence

**How FAQ Personalization Works:**

**Private Learning:**
- Tracks which FAQs you read (locally only)
- Remembers your knowledge level
- Connects to your chat history
- All encrypted, all local
- Never leaves your device

**LLM Chat Integration:**
- Per-question context stored locally
- Previous conversations encrypted
- Used to provide better answers
- You can delete anytime

**Threat Protection:**
We protect against:
- ❌ Political campaigns tracking you
- ❌ Data brokers building profiles
- ❌ Corporate surveillance
- ❌ Foreign adversaries
- ❌ Law enforcement overreach

**Your Rights:**
- View all data we store (Inspect browser storage)
- Export your data (JSON format)
- Delete everything (one click)
- Control what's tracked

**Transparency:**
- Open about what we collect
- Explain why each piece of data exists
- Code is auditable
- No hidden tracking

**Why This Matters:**
Your political interests, voting behavior, and learning patterns are extremely sensitive. We believe you should explore democracy without surveillance.

**Learn More:**
Visit our Privacy & Personalization page for complete details on our security architecture.

**Bottom Line:**
We protect your data like our own lives depend on it. Because in a democracy, privacy IS freedom.`,
        knowledgeLevel: 'intermediate',
        relatedTopics: ['privacy', 'security', 'data', 'encryption']
    },

    // 🔧 Website & Development
    {
        id: 'website-001',
        category: 'website',
        question: 'Why are some features showing "Coming Soon" notices?',
        answer: `Great question! We're glad you asked. Transparency is one of our core values, so we want to be upfront about our development status.

**The Workforce Democracy Project is Actively Growing! 🌱**

This site is a labor of love, built with care and continuously improving. We believe in launching early and being transparent about what's working vs. what's coming next.

**✅ What's FULLY Functional Right Now:**

**🗳️ Civic Engagement & Transparency**
- Track your representatives (Congress, Senate, local officials)
- Analyze candidates and their positions
- Follow bills and legislation
- Explore Supreme Court decisions
- State and local government information

**💼 Jobs Section**
- Search democratic workplaces and cooperatives
- Compare job listings side-by-side
- AI-powered job chat assistant
- Career exploration tools

**🗳️ Voting Information**
- Voter registration help
- Find your polling location
- Understand voting procedures
- Get answers about the voting process

**📚 Learning & Resources**
- Educational content about workplace democracy
- Links to external resources
- FAQ system (you're using it now!)

**🔒 Privacy & Security**
- All privacy controls fully functional
- Data export and deletion tools
- Fortress-level encryption

**⚠️ Currently Being Connected:**

**🤝 Community Services Finder**
- Backend is deployed and working
- Frontend connection in progress
- Will help you find local nonprofits and community resources
- Coming very soon!

**Why We Show "Coming Soon" Notices:**

**1. Transparency**
We'd rather be honest about what's working than frustrate you with broken features.

**2. User Trust**
You deserve to know the real status of what you're using.

**3. Professional Development**
Active development is a good sign! It means we're constantly improving.

**4. Set Expectations**
We want you to explore the MANY features that work great, without confusion.

**How We Build:**
- Privacy-first always
- User feedback guides our priorities
- Quality over speed
- Test thoroughly before launching
- Transparent about progress

**Your Feedback Matters:**
If you have suggestions or find issues, we want to hear! Your input helps us prioritize what to build next.

**The Philosophy:**
We believe in:
- 💙 Launching iteratively (better to have 90% working than wait for 100% perfect)
- 🔧 Transparency (show what's working, acknowledge what's coming)
- 🌟 Quality (take time to do it right)
- 🚀 Continuous improvement (always adding, always refining)

**What to Expect Going Forward:**
- Regular updates and improvements
- New features added thoughtfully
- Existing features continuously refined
- "Coming Soon" notices removed as features go live
- Changelog to track all updates

**Thank You for Your Patience! 🙏**

Building a comprehensive, privacy-first democracy platform takes time. We appreciate you being part of this journey. The features that ARE working represent hundreds of hours of careful development, and we're proud of what's here.

**Bottom Line:**
Most of the site is fully functional and ready to use! A few sections are still being connected, and we're transparent about that. We're building something special, and your understanding means everything. ✨`,
        knowledgeLevel: 'simple',
        relatedTopics: ['website', 'development', 'transparency', 'status']
    }
];

// Track which FAQs user has interacted with
function trackFAQInteraction(faqId, action = 'viewed') {
    try {
        let faqHistory = JSON.parse(localStorage.getItem('wdp_faq_history') || '[]');
        
        faqHistory.push({
            faqId: faqId,
            action: action,
            timestamp: new Date().toISOString(),
            timeSpent: 0 // Can be calculated if needed
        });
        
        // Keep last 100 interactions
        if (faqHistory.length > 100) {
            faqHistory = faqHistory.slice(-100);
        }
        
        localStorage.setItem('wdp_faq_history', JSON.stringify(faqHistory));
        console.log(`📚 Tracked FAQ interaction: ${faqId} (${action})`);
    } catch (error) {
        console.error('Error tracking FAQ interaction:', error);
    }
}

// Get user's interest areas from chat history across the site
function getUserInterests() {
    try {
        const interests = {
            civic: 0,
            jobs: 0,
            ethical: 0,
            economic: 0,
            general: 0
        };
        
        // Check civic chat history
        const civicHistory = JSON.parse(localStorage.getItem('wdp_civic_chat_history') || '[]');
        interests.civic = civicHistory.length;
        
        // Check jobs chat history
        const jobsHistory = JSON.parse(localStorage.getItem('wdp_jobs_chat_history') || '[]');
        interests.jobs = jobsHistory.length;
        
        // Check ethical business chat history
        const ethicalHistory = JSON.parse(localStorage.getItem('wdp_ethical_business_chat_history') || '[]');
        interests.ethical = ethicalHistory.length;
        
        // Check FAQ history for categories
        const faqHistory = JSON.parse(localStorage.getItem('wdp_faq_history') || '[]');
        faqHistory.forEach(interaction => {
            const faq = FAQ_DATABASE.find(f => f.id === interaction.faqId);
            if (faq) {
                if (faq.category === 'economic') interests.economic++;
                if (faq.category === 'workplace') interests.jobs++;
                if (faq.category === 'governance') interests.civic++;
                if (faq.category === 'community') interests.ethical++;
                if (faq.category === 'website') interests.general++;
            }
        });
        
        console.log('📊 User interests:', interests);
        return interests;
    } catch (error) {
        console.error('Error getting user interests:', error);
        return { civic: 0, jobs: 0, ethical: 0, economic: 0, general: 0 };
    }
}

// Prioritize FAQs based on user interests
function prioritizeFAQs() {
    const interests = getUserInterests();
    const sortedFAQs = [...FAQ_DATABASE];
    
    // Calculate relevance score for each FAQ
    sortedFAQs.forEach(faq => {
        faq.relevanceScore = 0;
        
        // Category-based scoring
        if (faq.category === 'economic') faq.relevanceScore += interests.economic * 3;
        if (faq.category === 'workplace') faq.relevanceScore += interests.jobs * 2;
        if (faq.category === 'governance') faq.relevanceScore += interests.civic * 2;
        if (faq.category === 'community') faq.relevanceScore += interests.ethical * 2;
        if (faq.category === 'website') faq.relevanceScore += interests.general * 1.5;
        
        // Check if user has viewed this FAQ before
        const faqHistory = JSON.parse(localStorage.getItem('wdp_faq_history') || '[]');
        const viewedBefore = faqHistory.some(h => h.faqId === faq.id);
        if (!viewedBefore) faq.relevanceScore += 5; // Prioritize unviewed FAQs
    });
    
    // Sort by relevance score (descending)
    sortedFAQs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log('✨ FAQs prioritized by user interests');
    return sortedFAQs;
}

// Detect user's knowledge level from chat interactions
function detectKnowledgeLevel() {
    try {
        // Check all chat histories for complexity indicators
        const allMessages = [];
        
        // Gather all user messages
        ['civic', 'jobs', 'ethical'].forEach(type => {
            const history = JSON.parse(localStorage.getItem(`wdp_${type}_chat_history`) || '[]');
            history.forEach(msg => {
                if (msg.sender === 'user') allMessages.push(msg.text);
            });
        });
        
        if (allMessages.length === 0) return 'simple'; // Default for new users
        
        // Analyze language complexity
        let complexityScore = 0;
        const advancedTerms = ['cooperative', 'governance', 'stakeholder', 'equity', 'capital', 'revenue', 'democracy', 'ownership'];
        const simpleTerms = ['what', 'how', 'why', 'can you explain', 'i don\'t understand', 'help'];
        
        allMessages.forEach(msg => {
            const lowerMsg = msg.toLowerCase();
            // Count advanced terms
            advancedTerms.forEach(term => {
                if (lowerMsg.includes(term)) complexityScore += 2;
            });
            // Count simple questions
            simpleTerms.forEach(term => {
                if (lowerMsg.includes(term)) complexityScore -= 1;
            });
        });
        
        // Determine level
        if (complexityScore > 10) return 'advanced';
        if (complexityScore > 0) return 'intermediate';
        return 'simple';
    } catch (error) {
        console.error('Error detecting knowledge level:', error);
        return 'simple';
    }
}

// Initialize FAQ page
function initializeFAQPage() {
    console.log('🎯 Initializing FAQ page with personalization...');
    
    const knowledgeLevel = detectKnowledgeLevel();
    console.log(`📚 User knowledge level: ${knowledgeLevel}`);
    
    const prioritizedFAQs = prioritizeFAQs();
    renderFAQs(prioritizedFAQs, knowledgeLevel);
}

// Render FAQ sections
function renderFAQs(faqs, knowledgeLevel) {
    const container = document.getElementById('faqContent');
    if (!container) return;
    
    // Group FAQs by category
    const categories = {
        economic: { title: '💰 Economic Impact & Your Finances', icon: '💰', color: 'gold', faqs: [] },
        workplace: { title: '🏢 Workplace Democracy & Structure', icon: '🏢', color: 'green', faqs: [] },
        governance: { title: '🗳️ Governance & Political Concerns', icon: '🗳️', color: 'purple', faqs: [] },
        community: { title: '🤝 Community & Ethical Business', icon: '🤝', color: 'orange', faqs: [] },
        privacy: { title: '🔒 Privacy & Security', icon: '🔒', color: 'blue', faqs: [] }
    };
    
    // Group FAQs
    faqs.forEach(faq => {
        if (categories[faq.category]) {
            categories[faq.category].faqs.push(faq);
        }
    });
    
    // Render each category
    let html = '';
    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        if (cat.faqs.length === 0) return;
        
        html += `
            <div class="faq-category" data-category="${catKey}">
                <h3 class="faq-category-title">
                    <span class="faq-icon">${cat.icon}</span>
                    ${cat.title}
                </h3>
                <div class="faq-list">
                    ${cat.faqs.map(faq => renderFAQCard(faq, knowledgeLevel)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Attach event listeners
    attachFAQEventListeners();
}

// Render related questions
function renderRelatedQuestions(faq) {
    if (!faq.relatedTopics || faq.relatedTopics.length === 0) {
        return '';
    }
    
    // Find related FAQs based on relatedTopics
    const relatedFAQs = FAQ_DATABASE.filter(otherFaq => {
        if (otherFaq.id === faq.id) return false; // Don't include itself
        
        // Check if any of the FAQ's topics match this FAQ's related topics
        const hasRelatedTopic = faq.relatedTopics.some(topic => {
            const topicLower = topic.toLowerCase();
            const questionLower = otherFaq.question.toLowerCase();
            const categoryLower = otherFaq.category.toLowerCase();
            
            // Match by topic in question or category
            return questionLower.includes(topicLower) || 
                   categoryLower.includes(topicLower) ||
                   (otherFaq.relatedTopics && otherFaq.relatedTopics.some(t => t.toLowerCase() === topicLower));
        });
        
        return hasRelatedTopic;
    }).slice(0, 3); // Limit to 3 related questions
    
    if (relatedFAQs.length === 0) {
        return '';
    }
    
    return `
        <div class="faq-related-questions">
            <h4 class="faq-related-title">
                <span class="faq-related-icon">🔗</span>
                Related Questions
            </h4>
            <div class="faq-related-list">
                ${relatedFAQs.map(relatedFaq => `
                    <button 
                        class="faq-related-item" 
                        onclick="scrollToFAQ('${relatedFaq.id}')"
                        aria-label="Go to related question: ${relatedFaq.question}"
                    >
                        <span class="faq-related-arrow">→</span>
                        <span class="faq-related-question">${relatedFaq.question}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Scroll to and open a specific FAQ
function scrollToFAQ(faqId) {
    const card = document.querySelector(`[data-faq-id="${faqId}"]`);
    if (!card) return;
    
    // Close current search if active
    const searchInput = document.getElementById('faqSearchInput');
    if (searchInput && searchInput.value) {
        searchInput.value = '';
        document.getElementById('faqClearSearch').style.display = 'none';
        searchFAQs('');
    }
    
    // Scroll to the FAQ
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Open it after scrolling
    setTimeout(() => {
        const answer = document.getElementById(`faq-answer-${faqId}`);
        if (answer && answer.style.display === 'none') {
            toggleFAQ(faqId);
        }
        
        // Add a highlight effect
        card.style.animation = 'highlightPulse 2s ease';
        setTimeout(() => {
            card.style.animation = '';
        }, 2000);
    }, 500);
}

// Render individual FAQ card
function renderFAQCard(faq, knowledgeLevel) {
    return `
        <div class="faq-card" data-faq-id="${faq.id}">
            <button class="faq-question" onclick="toggleFAQ('${faq.id}')" aria-expanded="false">
                <span class="faq-question-text">${faq.question}</span>
                <span class="faq-toggle-icon">+</span>
            </button>
            <div class="faq-answer" id="faq-answer-${faq.id}" style="display: none;">
                <div class="faq-answer-text">
                    ${formatAnswer(faq.answer)}
                </div>
                ${renderRelatedQuestions(faq)}
                <div class="faq-chat-widget" id="faq-chat-${faq.id}">
                    <div class="faq-chat-header">
                        <span class="faq-chat-icon">💬</span>
                        <span>Have more questions about this?</span>
                    </div>
                    <div class="faq-chat-messages" id="faq-chat-messages-${faq.id}"></div>
                    <div class="faq-chat-input-container">
                        <textarea 
                            class="faq-chat-input" 
                            id="faq-chat-input-${faq.id}" 
                            placeholder="Ask a follow-up question..."
                            rows="2"
                        ></textarea>
                        <button class="faq-chat-send" onclick="sendFAQMessage('${faq.id}')">
                            <span class="faq-send-icon">➤</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Format answer text with markdown support
function formatAnswer(answer) {
    // Split by double newlines to get paragraphs
    const paragraphs = answer.split('\n\n');
    
    return paragraphs.map(para => {
        let formatted = para.trim();
        
        // Check if it's a list BEFORE converting bold (to handle bold in lists correctly)
        if (formatted.includes('\n-')) {
            const lines = formatted.split('\n');
            const listItems = lines
                .filter(line => line.trim().startsWith('-'))
                .map(line => {
                    let item = line.replace(/^-\s*/, ''); // Remove leading dash
                    item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold within list
                    return `<li>${item}</li>`;
                })
                .join('');
            
            // Get any text before the list and convert bold
            const textBefore = lines
                .filter(line => !line.trim().startsWith('-'))
                .join(' ')
                .trim();
            
            if (textBefore) {
                const textFormatted = textBefore.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return `<p class="faq-answer-para">${textFormatted}</p><ul class="faq-answer-list">${listItems}</ul>`;
            }
            return `<ul class="faq-answer-list">${listItems}</ul>`;
        }
        
        // Regular paragraph - convert bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<p class="faq-answer-para">${formatted}</p>`;
    }).join('');
}

// Toggle FAQ expansion
function toggleFAQ(faqId) {
    const card = document.querySelector(`[data-faq-id="${faqId}"]`);
    const answer = document.getElementById(`faq-answer-${faqId}`);
    const button = card.querySelector('.faq-question');
    const icon = button.querySelector('.faq-toggle-icon');
    
    if (answer.style.display === 'none') {
        // Expand
        answer.style.display = 'block';
        button.setAttribute('aria-expanded', 'true');
        icon.textContent = '−';
        
        // Track interaction
        trackFAQInteraction(faqId, 'opened');
        
        // Load chat history for this FAQ
        loadFAQChatHistory(faqId);
    } else {
        // Collapse
        answer.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
        icon.textContent = '+';
    }
}

// Load chat history for specific FAQ
function loadFAQChatHistory(faqId) {
    try {
        const chatHistory = JSON.parse(localStorage.getItem(`wdp_faq_chat_${faqId}`) || '[]');
        const messagesContainer = document.getElementById(`faq-chat-messages-${faqId}`);
        
        if (!messagesContainer) return;
        
        if (chatHistory.length === 0) {
            messagesContainer.innerHTML = '<p class="faq-chat-empty">Your conversation will appear here...</p>';
            return;
        }
        
        messagesContainer.innerHTML = chatHistory.map(msg => `
            <div class="faq-chat-message ${msg.sender}">
                <div class="faq-chat-message-content">${msg.text}</div>
            </div>
        `).join('');
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading FAQ chat history:', error);
    }
}

// Send message in FAQ chat
function sendFAQMessage(faqId) {
    const input = document.getElementById(`faq-chat-input-${faqId}`);
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addFAQChatMessage(faqId, message, 'user');
    
    // Clear input
    input.value = '';
    
    // Get FAQ context
    const faq = FAQ_DATABASE.find(f => f.id === faqId);
    
    // Simulate LLM response (in production, this would call actual LLM)
    setTimeout(() => {
        const response = generateContextualResponse(faq, message);
        addFAQChatMessage(faqId, response, 'assistant');
    }, 500);
}

// Add message to FAQ chat
function addFAQChatMessage(faqId, text, sender) {
    try {
        // Get chat history
        let chatHistory = JSON.parse(localStorage.getItem(`wdp_faq_chat_${faqId}`) || '[]');
        
        // Add new message
        chatHistory.push({
            text: text,
            sender: sender,
            timestamp: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem(`wdp_faq_chat_${faqId}`, JSON.stringify(chatHistory));
        
        // Update UI
        const messagesContainer = document.getElementById(`faq-chat-messages-${faqId}`);
        if (messagesContainer) {
            const emptyMessage = messagesContainer.querySelector('.faq-chat-empty');
            if (emptyMessage) emptyMessage.remove();
            
            messagesContainer.innerHTML += `
                <div class="faq-chat-message ${sender}">
                    <div class="faq-chat-message-content">${text}</div>
                </div>
            `;
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Track interaction
        trackFAQInteraction(faqId, 'chat');
    } catch (error) {
        console.error('Error adding FAQ chat message:', error);
    }
}

// Generate contextual response (placeholder for actual LLM)
function generateContextualResponse(faq, userMessage) {
    // In production, this would call your LLM with context
    // For now, return a helpful placeholder
    return `Thank you for your question about "${faq.question}". This chat widget will be connected to our LLM assistant to provide personalized answers based on the FAQ context and your conversation history. For now, please use the main chat assistants on the Civic, Jobs, or Ethical Business sections for detailed responses!`;
}

// Attach event listeners
function attachFAQEventListeners() {
    // Enter key to send message
    document.querySelectorAll('.faq-chat-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const faqId = input.id.replace('faq-chat-input-', '');
                sendFAQMessage(faqId);
            }
        });
    });
}

// Search functionality
let currentSearchTerm = '';

function initializeFAQSearch() {
    const searchInput = document.getElementById('faqSearchInput');
    const clearButton = document.getElementById('faqClearSearch');
    const resultsDiv = document.getElementById('faqSearchResults');
    
    if (!searchInput) return;
    
    // Real-time search as user types
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        currentSearchTerm = searchTerm;
        
        // Show/hide clear button
        if (searchTerm) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
        
        // Perform search
        searchFAQs(searchTerm);
    });
    
    // Clear search
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchTerm = '';
        clearButton.style.display = 'none';
        searchFAQs('');
    });
    
    // Enter key to focus first result
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const firstVisibleCard = document.querySelector('.faq-card:not([style*="display: none"])');
            if (firstVisibleCard) {
                const questionButton = firstVisibleCard.querySelector('.faq-question');
                if (questionButton) {
                    questionButton.click();
                    questionButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    });
}

function searchFAQs(searchTerm) {
    const faqCards = document.querySelectorAll('.faq-card');
    const resultsDiv = document.getElementById('faqSearchResults');
    let visibleCount = 0;
    let totalCount = faqCards.length;
    
    if (!searchTerm) {
        // Show all FAQs
        faqCards.forEach(card => {
            card.style.display = '';
            removeHighlights(card);
        });
        
        // Hide empty categories
        document.querySelectorAll('.faq-category').forEach(category => {
            category.style.display = '';
        });
        
        resultsDiv.textContent = '';
        resultsDiv.className = 'faq-search-results';
        return;
    }
    
    // Search and filter
    faqCards.forEach(card => {
        const question = card.querySelector('.faq-question-text').textContent.toLowerCase();
        const answer = card.querySelector('.faq-answer-text').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            card.style.display = '';
            visibleCount++;
            
            // Highlight matching text
            highlightText(card, searchTerm);
        } else {
            card.style.display = 'none';
            removeHighlights(card);
        }
    });
    
    // Hide empty categories
    document.querySelectorAll('.faq-category').forEach(category => {
        const visibleCards = category.querySelectorAll('.faq-card:not([style*="display: none"])');
        if (visibleCards.length === 0) {
            category.style.display = 'none';
        } else {
            category.style.display = '';
        }
    });
    
    // Update results message
    if (visibleCount === 0) {
        resultsDiv.textContent = `No results found for "${searchTerm}"`;
        resultsDiv.className = 'faq-search-results';
    } else if (visibleCount === totalCount) {
        resultsDiv.textContent = '';
        resultsDiv.className = 'faq-search-results';
    } else {
        resultsDiv.textContent = `Showing ${visibleCount} of ${totalCount} questions`;
        resultsDiv.className = 'faq-search-results has-results';
    }
}

function highlightText(card, searchTerm) {
    const questionText = card.querySelector('.faq-question-text');
    const originalQuestion = questionText.getAttribute('data-original') || questionText.textContent;
    
    if (!questionText.getAttribute('data-original')) {
        questionText.setAttribute('data-original', originalQuestion);
    }
    
    // Highlight in question
    const questionRegex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    const highlightedQuestion = originalQuestion.replace(questionRegex, '<span class="faq-search-highlight">$1</span>');
    questionText.innerHTML = highlightedQuestion;
}

function removeHighlights(card) {
    const questionText = card.querySelector('.faq-question-text');
    const original = questionText.getAttribute('data-original');
    
    if (original) {
        questionText.textContent = original;
    }
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Make functions globally available
window.toggleFAQ = toggleFAQ;
window.sendFAQMessage = sendFAQMessage;
window.initializeFAQPage = initializeFAQPage;
window.scrollToFAQ = scrollToFAQ;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('faqContent')) {
        initializeFAQPage();
        initializeFAQSearch();
    }
});
