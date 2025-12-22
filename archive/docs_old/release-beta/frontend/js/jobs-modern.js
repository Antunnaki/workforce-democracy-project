/**
 * JOBS SECTION - MODERN IMPLEMENTATION V35.1.0
 * Created: 2025-01-25
 * Updated: 2025-01-26 (Fixed toggleInlineChat to add .active class to button)
 * 
 * Purpose: Complete rebuild with LLM integration readiness
 * Backend: Netlify Functions → Njalla hosting
 * LLM: Groq API with Llama 3 70B model
 * 
 * Cost-Saving Strategy: SMART LOCAL TOOLS HYBRID
 * 1. Local pattern matching for common questions (FREE, 0ms)
 * 2. Groq/Llama3 fallback for complex queries (LOW COST, ~500ms)
 * 3. Cache all LLM responses permanently for reuse
 * 
 * Philosophy: Kind, clear, forward-thinking presentation
 * 
 * V35.1.0 FIX: toggleInlineChat now adds/removes .active class to toggle button
 *              for proper border-radius styling when accordion opens/closes
 */

/* ============================================================================
   STATE MANAGEMENT
   ============================================================================ */

const JobsModernState = {
    initialized: false,
    currentIndustry: 'technology',
    selectedProfession: null,
    chatHistory: [],
    inlineChatOpen: false,
    comparisonModalOpen: false,
    
    // Cache for LLM-generated comparisons
    comparisonCache: {},
    
    // User's saved profession (from personalization)
    userProfession: null
};

/* ============================================================================
   INDUSTRY & PROFESSION DATABASE
   ============================================================================ */

const INDUSTRIES_DATABASE = {
    technology: {
        name: 'Technology',
        icon: '💻',
        description: 'Software, IT, and digital innovation',
        professions: [
            'Software Developer', 'Data Scientist', 'IT Support Specialist', 'Cybersecurity Analyst',
            'Web Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cloud Architect',
            'Database Administrator', 'Network Engineer', 'Systems Analyst', 'UX/UI Designer',
            'Product Manager', 'Technical Writer', 'QA Engineer', 'Machine Learning Engineer',
            'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Game Developer',
            'AI Engineer', 'Blockchain Developer', 'IoT Specialist', 'AR/VR Developer'
        ]
    },
    healthcare: {
        name: 'Healthcare',
        icon: '🏥',
        description: 'Medical, nursing, and health services',
        professions: [
            'Doctor', 'Nurse', 'Surgeon', 'Pharmacist', 'Physical Therapist', 'Dentist',
            'Medical Technician', 'Healthcare Administrator', 'Paramedic', 'Radiologist',
            'Psychiatrist', 'Pediatrician', 'Anesthesiologist', 'Cardiologist',
            'Occupational Therapist', 'Speech Therapist', 'Nutritionist', 'Lab Technician',
            'Medical Researcher', 'Public Health Specialist', 'Epidemiologist', 'Home Health Aide',
            'Dental Hygienist', 'Medical Assistant', 'Respiratory Therapist', 'Ultrasound Technician'
        ]
    },
    education: {
        name: 'Education',
        icon: '📚',
        description: 'Teaching, training, and academic work',
        professions: [
            'Teacher', 'Professor', 'School Principal', 'Education Administrator',
            'Librarian', 'School Counselor', 'Special Education Teacher', 'Teaching Assistant',
            'Curriculum Developer', 'Education Consultant', 'Adult Education Instructor',
            'Early Childhood Educator', 'College Advisor', 'Tutor', 'Education Researcher',
            'Distance Learning Coordinator', 'School Psychologist', 'Athletic Director',
            'Academic Dean', 'Department Chair', 'ESL Teacher', 'Vocational Instructor'
        ]
    },
    creative: {
        name: 'Creative Arts',
        icon: '🎨',
        description: 'Design, media, and artistic professions',
        professions: [
            'Graphic Designer', 'Photographer', 'Video Editor', 'Animator', 'Illustrator',
            'Art Director', 'Copywriter', 'Content Creator', 'Social Media Manager',
            'Marketing Specialist', 'Brand Strategist', 'Film Director', 'Sound Engineer',
            'Music Producer', 'Journalist', 'Editor', 'Public Relations Specialist',
            'Event Planner', '3D Artist', 'Motion Graphics Designer', 'Creative Director'
        ]
    },
    trades: {
        name: 'Skilled Trades',
        icon: '🔧',
        description: 'Construction, repair, and technical skills',
        professions: [
            'Electrician', 'Plumber', 'Carpenter', 'Welder', 'HVAC Technician',
            'Auto Mechanic', 'Construction Worker', 'Painter', 'Roofer', 'Mason',
            'Pipefitter', 'Sheet Metal Worker', 'Landscaper', 'Heavy Equipment Operator',
            'Locksmith', 'Glazier', 'Insulation Worker', 'Flooring Installer'
        ]
    },
    service: {
        name: 'Service Industry',
        icon: '🍽️',
        description: 'Hospitality, retail, and customer service',
        professions: [
            'Chef', 'Restaurant Manager', 'Barista', 'Bartender', 'Server',
            'Hotel Manager', 'Retail Manager', 'Cashier', 'Sales Associate',
            'Customer Service Representative', 'Flight Attendant', 'Housekeeper',
            'Concierge', 'Event Coordinator', 'Travel Agent', 'Tour Guide'
        ]
    },
    business: {
        name: 'Business & Finance',
        icon: '💼',
        description: 'Finance, management, and administration',
        professions: [
            'Accountant', 'Financial Analyst', 'Business Consultant', 'HR Manager',
            'Project Manager', 'Operations Manager', 'Marketing Manager', 'Sales Manager',
            'Investment Banker', 'Real Estate Agent', 'Insurance Agent', 'Auditor',
            'Tax Preparer', 'Financial Advisor', 'Business Analyst', 'Supply Chain Manager'
        ]
    },
    public_service: {
        name: 'Public Service',
        icon: '🚒',
        description: 'Government, emergency, and community services',
        professions: [
            'Police Officer', 'Firefighter', 'Social Worker', 'Public Administrator',
            'Urban Planner', 'Emergency Medical Technician', 'Park Ranger',
            'Postal Worker', 'Court Reporter', 'Probation Officer', 'Public Defender',
            'City Manager', 'Community Organizer', 'Nonprofit Director'
        ]
    }
};

/* ============================================================================
   INITIALIZATION
   ============================================================================ */

function initializeJobsModern() {
    console.log('💼 Initializing Jobs Section V35.0.0...');
    
    if (JobsModernState.initialized) {
        console.log('✅ Jobs section already initialized');
        return;
    }
    
    try {
        // Load user's saved profession from personalization
        loadUserProfession();
        
        // Render industry tabs
        renderIndustryTabs();
        
        // Render profession cards for default industry
        renderProfessionCards(JobsModernState.currentIndustry);
        
        // Setup inline chat
        setupInlineChat();
        
        // Load comparison cache from localStorage
        loadComparisonCache();
        
        JobsModernState.initialized = true;
        console.log('✅ Jobs section initialized successfully');
    } catch (error) {
        console.error('❌ Jobs section initialization failed:', error);
    }
}

/* ============================================================================
   USER PROFESSION (From Personalization System)
   ============================================================================ */

function loadUserProfession() {
    try {
        const saved = localStorage.getItem('wdp_user_profession');
        if (saved) {
            JobsModernState.userProfession = JSON.parse(saved);
            console.log('✅ Loaded user profession:', JobsModernState.userProfession);
        }
    } catch (error) {
        console.error('❌ Failed to load user profession:', error);
    }
}

function saveUserProfession(profession) {
    try {
        const data = {
            profession: profession,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('wdp_user_profession', JSON.stringify(data));
        JobsModernState.userProfession = data;
        console.log('✅ Saved user profession:', profession);
    } catch (error) {
        console.error('❌ Failed to save user profession:', error);
    }
}

/* ============================================================================
   RENDER FUNCTIONS
   ============================================================================ */

function renderIndustryTabs() {
    const container = document.getElementById('jobsIndustryTabs');
    if (!container) return;
    
    const tabs = Object.entries(INDUSTRIES_DATABASE).map(([id, industry]) => {
        const isActive = id === JobsModernState.currentIndustry;
        return `
            <button 
                class="jobs-industry-tab ${isActive ? 'active' : ''}"
                onclick="switchIndustry('${id}')"
                data-industry="${id}">
                ${industry.icon} ${industry.name}
            </button>
        `;
    }).join('');
    
    container.innerHTML = tabs;
}

function switchIndustry(industryId) {
    JobsModernState.currentIndustry = industryId;
    
    // Update tab states
    document.querySelectorAll('.jobs-industry-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.industry === industryId);
    });
    
    // Render professions for this industry
    renderProfessionCards(industryId);
}

function renderProfessionCards(industryId) {
    const container = document.getElementById('jobsProfessionsGrid');
    if (!container) return;
    
    const industry = INDUSTRIES_DATABASE[industryId];
    if (!industry) return;
    
    const cards = industry.professions.map(profession => {
        return `
            <div class="job-card" onclick="openComparisonModal('${profession}')">
                <div class="job-icon">${industry.icon}</div>
                <div class="job-title">${profession}</div>
                <div class="job-preview">
                    Discover how ${profession.toLowerCase()} work transforms in democratic workplaces.
                </div>
                <button class="explore-btn" onclick="event.stopPropagation(); openComparisonModal('${profession}')">
                    Compare Models →
                </button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = cards;
}

/* ============================================================================
   COMPARISON MODAL
   ============================================================================ */

async function openComparisonModal(profession) {
    console.log('🔍 Opening comparison for:', profession);
    
    JobsModernState.selectedProfession = profession;
    JobsModernState.comparisonModalOpen = true;
    
    // Save profession to personalization if first time viewing any job
    if (!JobsModernState.userProfession) {
        saveUserProfession(profession);
    }
    
    const modal = document.getElementById('jobComparisonModal');
    if (!modal) return;
    
    modal.classList.add('active');
    
    // Show loading state
    const body = document.getElementById('jobComparisonBody');
    if (body) {
        body.innerHTML = `
            <div class="comparison-loading">
                <div class="spinner"></div>
                <p>Loading comparison for ${profession}...</p>
            </div>
        `;
    }
    
    // Load comparison data
    const comparisonData = await loadComparisonData(profession);
    
    // Render comparison
    renderComparison(profession, comparisonData);
}

function closeComparisonModal() {
    const modal = document.getElementById('jobComparisonModal');
    if (modal) {
        modal.classList.remove('active');
    }
    JobsModernState.comparisonModalOpen = false;
    JobsModernState.selectedProfession = null;
}

async function loadComparisonData(profession) {
    // Check cache first (localStorage)
    if (JobsModernState.comparisonCache[profession]) {
        console.log('✅ Cache hit:', profession);
        return JobsModernState.comparisonCache[profession];
    }
    
    // Check if backend API is available
    const backendAvailable = await checkBackendAvailable();
    
    if (backendAvailable) {
        // Call backend API to get LLM-generated comparison
        try {
            const data = await fetchComparisonFromBackend(profession);
            
            // Cache the result
            JobsModernState.comparisonCache[profession] = data;
            saveComparisonCache();
            
            return data;
        } catch (error) {
            console.error('❌ Backend API failed:', error);
            // Fall back to generic template
            return generateGenericComparison(profession);
        }
    } else {
        // Backend not available - use generic template
        console.log('⚠️ Backend not available, using generic template');
        return generateGenericComparison(profession);
    }
}

async function checkBackendAvailable() {
    // TODO: Check if Netlify Functions are deployed
    // For now, return false (backend not ready)
    return false;
}

async function fetchComparisonFromBackend(profession) {
    // TODO: Call Netlify Function → Groq API with Llama 3
    // Endpoint: /.netlify/functions/compare-job
    
    const response = await fetch('/.netlify/functions/compare-job', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profession: profession,
            userContext: {
                location: getUserLocation(),
                savedProfession: JobsModernState.userProfession?.profession
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`Backend API failed: ${response.status}`);
    }
    
    return await response.json();
}

function generateGenericComparison(profession) {
    // Generic but well-written template (kind, clear, forward-thinking)
    return {
        profession: profession,
        traditional: {
            'Decision Making': `In traditional ${profession.toLowerCase()} roles, decision-making typically flows from the top down. Management and leadership teams set strategic direction, allocate resources, and determine priorities. While you may have input on your immediate work, major decisions about the direction of projects, budgets, and organizational goals are usually made by those in senior positions. Your expertise is valued, but your voice in shaping the bigger picture may be limited.`,
            
            'Compensation': `${profession} compensation in traditional workplaces usually consists of a fixed salary or hourly wage, often with annual raises based on performance reviews and market conditions. Benefits like health insurance, retirement plans, and paid time off vary significantly by employer. Bonuses may be available but are typically tied to individual performance metrics or company profitability, with profit-sharing being relatively rare. While you work hard to create value, the financial rewards you receive may not fully reflect the value you generate for the organization.`,
            
            'Work Direction': `Your day-to-day work is generally directed by supervisors, project managers, or department heads. You're given tasks and objectives to complete within established frameworks and processes. While you may have some autonomy in how you execute your responsibilities, the overall direction, priorities, and methods are determined by others. Your schedule, workload, and project assignments are managed by leadership, with your preferences considered but not always prioritized.`,
            
            'Profit Sharing': `In most traditional settings, profits flow primarily to shareholders and executives. While some companies offer stock options or profit-sharing programs, these are often limited to senior leadership or come with lengthy vesting periods. The wealth generated by your hard work and expertise primarily benefits those at the top of the organizational hierarchy or distant shareholders, rather than being shared equitably among all who contributed to creating that value.`,
            
            'Job Security': `Your job security depends largely on factors outside your control—company profitability, market conditions, and executive decisions about restructuring or downsizing. During economic downturns or strategic shifts, positions can be eliminated regardless of individual performance. While unions and employment contracts offer some protection, many ${profession.toLowerCase()} roles remain "at-will," meaning employment can be terminated at any time. Your livelihood rests in the hands of decision-makers who may prioritize short-term profits over long-term employee stability.`,
            
            'Work-Life Balance': `Work-life balance policies are set by management and HR, reflecting organizational priorities that may or may not align with your needs. While some progressive companies offer flexibility, many traditional workplaces expect employees to adapt to rigid schedules and demanding workloads. Overtime, weekend work, and high-pressure deadlines are common, especially in competitive industries. Your ability to balance work with family, health, and personal interests often depends on your manager's goodwill rather than being a guaranteed right.`
        },
        democratic: {
            'Decision Making': `Imagine being part of a worker cooperative where you and your colleagues collectively shape the direction of your profession. As a member-owner, you have real voting power on major decisions—from which projects to pursue, to how resources are allocated, to strategic partnerships and organizational priorities. Your expertise as a ${profession.toLowerCase()} isn't just valued; it's essential to collective decision-making. Regular member meetings, democratic processes, and transparent communication ensure everyone's voice matters. You're not just doing work; you're helping build the future of your workplace together.`,
            
            'Compensation': `In a democratic workplace, your compensation reflects the true value you create. Beyond fair base pay (often matching or exceeding traditional wages), you share in the surplus you help generate. Instead of profits flowing to distant shareholders, they're distributed among worker-owners through annual profit-sharing, patronage dividends, or reinvestment in the cooperative's growth. Your financial well-being is directly tied to collective success, creating powerful incentives for collaboration and innovation. Benefits are designed democratically, ensuring they meet real needs rather than corporate budget constraints.`,
            
            'Work Direction': `You and your fellow worker-owners collectively determine how work is organized and distributed. Rather than having assignments handed down, you participate in discussions about project priorities, workload distribution, and role specialization. Teams self-organize based on expertise, interest, and capacity, with rotating leadership roles ensuring everyone develops diverse skills. Your schedule, work methods, and professional development are shaped through democratic processes that honor both organizational needs and individual preferences. You have genuine autonomy supported by collective accountability.`,
            
            'Profit Sharing': `Every dollar of surplus your cooperative generates is shared among those who created it—you and your fellow worker-owners. Profit-sharing isn't a corporate perk but a fundamental right of ownership. Distribution formulas are decided democratically, often based on hours worked, seniority, or equitable splits. Successful years mean direct financial rewards for everyone, while challenging years are weathered together. Rather than enriching distant shareholders, your hard work builds collective wealth that benefits you, your colleagues, and your community.`,
            
            'Job Security': `As a worker-owner, your job security is built on collective ownership and democratic decision-making. Layoffs and downsizing require member approval, ensuring such decisions are made only when absolutely necessary and with full transparency. The cooperative's commitment to member well-being means exploring alternatives like reduced hours, voluntary sabbaticals, or pivoting to new services before considering layoffs. Your security comes from being an owner, not just an employee—your livelihood is protected by the same people who share it. Economic challenges are faced together, with decisions made by those most affected.`,
            
            'Work-Life Balance': `Work-life balance policies in democratic workplaces are created by the people they affect—you and your colleagues. Through democratic processes, members establish schedules, flexibility policies, and workload expectations that honor everyone's needs for rest, family time, health, and personal growth. Rather than management dictating hours and availability, cooperative members collaboratively design systems that sustain long-term well-being. Flexible schedules, generous time off, sabbaticals, and support for life transitions are common because they're decided by people who understand their importance firsthand. Your well-being isn't a corporate perk—it's a democratic right.`
        },
        transformations: [
            {
                title: 'From Employee to Owner',
                description: `As a ${profession.toLowerCase()}, you transition from being hired labor to being a democratic owner. You gain equity in the enterprise, voting rights on major decisions, and a share of profits. Your relationship to your work fundamentally changes—you're not working for someone else's benefit, but building something you collectively own and control.`
            },
            {
                title: 'From Hierarchy to Democracy',
                description: 'Decision-making shifts from top-down management to collective governance. Instead of following orders, you participate in deliberation and voting on strategic direction, resource allocation, and workplace policies. Your expertise and insights aren't just heard—they shape actual outcomes through democratic processes.'
            },
            {
                title: 'From Profit Extraction to Shared Prosperity',
                description: 'The value you create no longer flows primarily to distant shareholders and executives. Instead, surplus is shared among all worker-owners who generated it, either through profit-sharing, reinvestment in the cooperative, or community benefit. Your hard work translates directly into collective prosperity rather than enriching a small group at the top.'
            },
            {
                title: 'From Precarity to Collective Security',
                description: 'Job security transforms from depending on managerial whims or market volatility to being grounded in collective ownership and democratic accountability. Decisions about employment, restructuring, or organizational changes require member input and approval, ensuring your livelihood is protected by people who share your stake in success.'
            }
        ],
        examples: [
            {
                name: 'Worker Cooperatives Worldwide',
                location: 'Global',
                description: `Worker cooperatives exist in virtually every industry and profession, including ${profession.toLowerCase()} roles. While specific cooperatives vary by region and specialization, the cooperative movement demonstrates that democratic workplaces are viable, sustainable, and often more resilient than traditional businesses. Mondragon in Spain (80,000+ worker-owners), Cooperative Home Care Associates in New York, and thousands of smaller cooperatives worldwide prove that democratic ownership works.`,
                url: 'https://institute.coop/'
            },
            {
                name: 'Platform Cooperatives',
                location: 'Digital/Global',
                description: `Emerging platform cooperatives are creating democratic alternatives to gig economy exploitation, including roles for ${profession.toLowerCase()}. These cooperatives use technology to coordinate work while ensuring workers own and govern the platforms they use, keeping profits local and decisions democratic.`,
                url: 'https://platform.coop/'
            },
            {
                name: 'Local Cooperative Development Centers',
                location: 'Your Community',
                description: `Cooperative development organizations in many regions support the creation of new worker cooperatives across industries. If you're interested in starting or joining a cooperative in your field as a ${profession.toLowerCase()}, these centers provide training, financing, and technical assistance to make democratic workplaces a reality.`,
                url: 'https://usworker.coop/home/'
            }
        ],
        metadata: {
            generatedAt: new Date().toISOString(),
            source: 'generic_template',
            llmGenerated: false
        }
    };
}

function renderComparison(profession, data) {
    const body = document.getElementById('jobComparisonBody');
    if (!body) return;
    
    // Update header
    const header = document.getElementById('jobComparisonHeader');
    if (header) {
        header.innerHTML = `
            <h3>${profession}</h3>
            <div class="subtitle">Traditional vs Democratic Workplace Comparison</div>
        `;
    }
    
    // Render comparison sections
    const categories = Object.keys(data.traditional);
    const comparisonHTML = categories.map(category => {
        return `
            <div class="comparison-section">
                <h4>
                    <span class="icon">${getCategoryIcon(category)}</span>
                    ${category}
                </h4>
                <div class="comparison-grid">
                    <div class="comparison-card">
                        <h5>Traditional Model</h5>
                        <p>${data.traditional[category]}</p>
                    </div>
                    <div class="comparison-card">
                        <h5>Democratic Model</h5>
                        <p>${data.democratic[category]}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Render transformations
    const transformationsHTML = `
        <div class="comparison-section">
            <h4>
                <span class="icon">🔄</span>
                Key Transformations
            </h4>
            <div class="transformation-list">
                ${data.transformations.map(t => `
                    <div class="transformation-item">
                        <strong>${t.title}</strong>
                        <p>${t.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Render examples
    const examplesHTML = `
        <div class="comparison-section">
            <h4>
                <span class="icon">🏢</span>
                Real-World Examples
            </h4>
            <div class="examples-grid">
                ${data.examples.map(ex => `
                    <div class="example-card">
                        <h6>${ex.name}</h6>
                        <div class="location">📍 ${ex.location}</div>
                        <p>${ex.description}</p>
                        <a href="${ex.url}" target="_blank" rel="noopener noreferrer">
                            Learn more →
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    body.innerHTML = comparisonHTML + transformationsHTML + examplesHTML;
}

function getCategoryIcon(category) {
    const icons = {
        'Decision Making': '🗳️',
        'Compensation': '💰',
        'Work Direction': '🎯',
        'Profit Sharing': '📈',
        'Job Security': '🔒',
        'Work-Life Balance': '⚖️'
    };
    return icons[category] || '📋';
}

/* ============================================================================
   COMPARISON CACHE (localStorage)
   ============================================================================ */

function loadComparisonCache() {
    try {
        const cached = localStorage.getItem('wdp_job_comparisons_cache');
        if (cached) {
            JobsModernState.comparisonCache = JSON.parse(cached);
            console.log('✅ Loaded comparison cache:', Object.keys(JobsModernState.comparisonCache).length, 'professions');
        }
    } catch (error) {
        console.error('❌ Failed to load comparison cache:', error);
    }
}

function saveComparisonCache() {
    try {
        localStorage.setItem('wdp_job_comparisons_cache', JSON.stringify(JobsModernState.comparisonCache));
        console.log('✅ Saved comparison cache');
    } catch (error) {
        console.error('❌ Failed to save comparison cache:', error);
    }
}

/* ============================================================================
   INLINE AI CHAT WIDGET
   ============================================================================ */

function setupInlineChat() {
    const chatInput = document.getElementById('jobsInlineChatInput');
    const chatSend = document.getElementById('jobsInlineChatSend');
    
    if (chatInput && chatSend) {
        chatSend.addEventListener('click', sendInlineChatMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendInlineChatMessage();
            }
        });
    }
    
    // Load chat history from localStorage
    loadChatHistory();
}

function toggleJobsInlineChat() {
    const chatWindow = document.getElementById('jobsInlineChatWindow');
    const chatToggle = document.getElementById('jobsInlineChatToggle');
    
    if (!chatWindow || !chatToggle) return;
    
    JobsModernState.inlineChatOpen = !JobsModernState.inlineChatOpen;
    
    if (JobsModernState.inlineChatOpen) {
        chatWindow.classList.add('active');
        chatToggle.classList.add('active'); // CRITICAL FIX: Add active to toggle button for border-radius styling
        const arrow = chatToggle.querySelector('.arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        chatWindow.classList.remove('active');
        chatToggle.classList.remove('active'); // CRITICAL FIX: Remove active from toggle button
        const arrow = chatToggle.querySelector('.arrow');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}

async function sendInlineChatMessage() {
    const input = document.getElementById('jobsInlineChatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addChatMessage(message, 'user');
    
    // Generate response using Smart Local Tools hybrid
    const response = await generateChatResponse(message);
    
    // Add assistant message to chat
    addChatMessage(response, 'assistant');
    
    // Save chat history
    saveChatHistory();
}

function addChatMessage(text, role) {
    const messagesContainer = document.getElementById('jobsInlineChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `jobs-inline-chat-message jobs-inline-chat-message-${role}`;
    messageDiv.textContent = text;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add to state
    JobsModernState.chatHistory.push({ role, text, timestamp: new Date().toISOString() });
}

async function generateChatResponse(query) {
    console.log('🤖 Generating response for:', query);
    
    const queryLower = query.toLowerCase();
    
    // SMART LOCAL TOOLS: Pattern matching for common questions (FREE, 0ms)
    
    // Pattern: How does [profession] work in cooperatives?
    const professionMatch = queryLower.match(/how (?:does|do) (.+?) work/);
    if (professionMatch) {
        const profession = professionMatch[1];
        return `Great question! To learn how ${profession} works in democratic workplaces, try clicking on that profession in the jobs grid above. You'll see a detailed comparison between traditional and cooperative models, including real examples of worker-owned businesses in that field. Would you like me to explain anything specific about worker cooperatives?`;
    }
    
    // Pattern: What is a worker cooperative?
    if (queryLower.includes('worker cooperative') || queryLower.includes('worker-owned') || queryLower.includes('what is a co-op')) {
        return `A worker cooperative is a business that's owned and democratically controlled by its employees! Here's what makes them special:\n\n🗳️ **Democratic Ownership**: Every worker has one vote in major decisions\n💰 **Profit Sharing**: Surplus is shared among all who created it\n🎯 **Collective Management**: Workers participate in strategic planning\n🔒 **Job Security**: Layoffs require member approval\n\nWant to see how this works for a specific profession? Just ask or click on any job above!`;
    }
    
    // Pattern: How much do [profession] make?
    if (queryLower.includes('how much') || queryLower.includes('salary') || queryLower.includes('pay')) {
        return `Salaries in worker cooperatives often match or slightly exceed traditional workplaces, but with a crucial difference: profit-sharing! While base pay might be similar, cooperative members receive:\n\n💰 Annual profit distributions (typically 10-20% of earnings)\n📈 Equity ownership that grows over time\n🎁 Better benefits decided democratically\n\nTo see specific salary info for a profession, click on that job above for a detailed comparison. Which profession are you curious about?`;
    }
    
    // Pattern: Are there cooperatives near me?
    if (queryLower.includes('near me') || queryLower.includes('in my area') || queryLower.includes('local')) {
        return `Finding worker cooperatives in your area is easier than you might think! Here's how:\n\n1. **Search the Directory**: Visit directory.usworker.coop to find cooperatives by location\n2. **Enable Personalization**: Use our personalization feature to see local ethical businesses\n3. **Connect Locally**: Many regions have cooperative development centers that know local co-ops\n\nWhat type of work are you interested in? I can help you understand what to look for!`;
    }
    
    // Pattern: How do I start/join?
    if (queryLower.includes('how do i') || queryLower.includes('how can i') || queryLower.includes('start') || queryLower.includes('join')) {
        return `Wonderful that you're interested! Here are your paths forward:\n\n**To Join an Existing Cooperative:**\n1. Find cooperatives in your field (use directories like usworker.coop)\n2. Check their membership requirements\n3. Apply or express interest when positions open\n\n**To Start a New Cooperative:**\n1. Connect with a local cooperative development center\n2. Find fellow workers interested in democratic ownership\n3. Get training and support (often free through co-op networks)\n\nWhat profession are you in? I can give more specific guidance!`;
    }
    
    // Pattern: Compare [profession1] and [profession2]
    if (queryLower.includes('compare') || queryLower.includes('difference between')) {
        return `To compare different professions in democratic workplaces, try clicking on each profession in the grid above! Each comparison shows:\n\n✨ How that specific role transforms\n💡 Real-world examples of cooperatives\n📊 Salary and benefits differences\n🔄 Key changes from traditional models\n\nWhich professions are you most interested in comparing?`;
    }
    
    // Default: Check if backend is available for LLM response
    const backendAvailable = await checkBackendAvailable();
    
    if (backendAvailable) {
        // Call Groq/Llama3 via Netlify Function
        try {
            const response = await fetch('/.netlify/functions/chat-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: query,
                    history: JobsModernState.chatHistory.slice(-5), // Last 5 messages for context
                    userProfession: JobsModernState.userProfession?.profession
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch (error) {
            console.error('❌ Backend chat failed:', error);
        }
    }
    
    // Fallback: Kind, helpful response pointing to specific resources
    return `I'm here to help you explore democratic workplaces! You can:\n\n💼 Click any profession above to see detailed comparisons\n📚 Ask about worker cooperatives in general\n🔍 Search for specific information about a job\n📍 Learn about cooperatives in your area\n\nWhat would you like to know more about?`;
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('wdp_jobs_chat_history');
        if (saved) {
            JobsModernState.chatHistory = JSON.parse(saved);
            
            // Render saved messages
            const messagesContainer = document.getElementById('jobsInlineChatMessages');
            if (messagesContainer && JobsModernState.chatHistory.length > 0) {
                JobsModernState.chatHistory.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `jobs-inline-chat-message jobs-inline-chat-message-${msg.role}`;
                    messageDiv.textContent = msg.text;
                    messagesContainer.appendChild(messageDiv);
                });
            }
        }
    } catch (error) {
        console.error('❌ Failed to load chat history:', error);
    }
}

function saveChatHistory() {
    try {
        // Keep only last 50 messages to avoid localStorage limits
        const recentHistory = JobsModernState.chatHistory.slice(-50);
        localStorage.setItem('wdp_jobs_chat_history', JSON.stringify(recentHistory));
    } catch (error) {
        console.error('❌ Failed to save chat history:', error);
    }
}

/* ============================================================================
   HELPER FUNCTIONS
   ============================================================================ */

function getUserLocation() {
    try {
        const locationData = localStorage.getItem('wdp_user_location');
        if (locationData) {
            const parsed = JSON.parse(locationData);
            return parsed.derivedLocation || 'Unknown';
        }
    } catch (error) {
        console.error('❌ Failed to get user location:', error);
    }
    return 'Unknown';
}

/* ============================================================================
   INITIALIZE ON PAGE LOAD
   ============================================================================ */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeJobsModern);
} else {
    initializeJobsModern();
}

// Export functions for global access
window.switchIndustry = switchIndustry;
window.openComparisonModal = openComparisonModal;
window.closeComparisonModal = closeComparisonModal;
window.toggleInlineChat = toggleInlineChat;
