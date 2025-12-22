/**
 * PHILOSOPHIES MODULE
 * 17 Core Philosophies of the Workforce Democracy Project
 */

const PHILOSOPHIES = [
    {
        number: 1,
        title: 'Worker Empowerment',
        description: 'Every worker deserves democratic decision-making power in their workplace. True empowerment comes from giving workers real voice and agency.',
        icon: 'images/philosophy-icons/01-worker-empowerment.svg',
        examples: 'Worker-owned cooperatives where employees vote on major decisions, elect leadership, and shape company direction.',
        whyItMatters: 'Without worker empowerment, businesses make decisions that affect people\'s lives without their input. This philosophy ensures that those who do the work have real power to shape their workplaces, leading to better decisions, higher job satisfaction, and genuine workplace democracy.'
    },
    {
        number: 2,
        title: 'Economic Justice',
        description: 'Fair compensation and profit sharing for all who contribute to creating value. Workers deserve to benefit from the success they help build.',
        icon: 'images/philosophy-icons/02-economic-justice.svg',
        examples: 'Equal profit distribution systems, living wages, and transparent compensation structures.',
        whyItMatters: 'When wealth concentrates at the top while workers struggle, our entire economy suffers. Economic justice ensures that everyone who contributes to success shares in the rewards, creating stronger communities, more stable families, and a healthier economy for everyone.'
    },
    {
        number: 3,
        title: 'Community Centered',
        description: 'Workplaces should prioritize local community benefit over external shareholder profits. Businesses exist within and serve communities.',
        icon: 'images/philosophy-icons/03-community-centered.svg',
        examples: 'Local reinvestment, community partnerships, and prioritizing community needs in business decisions.',
        whyItMatters: 'When businesses extract wealth from communities without giving back, those communities deteriorate. Community-centered workplaces create lasting local prosperity, strengthen social bonds, and ensure business decisions benefit the people who live and work in those communities.'
    },
    {
        number: 4,
        title: 'Environmental Stewardship',
        description: 'Sustainable practices must be integrated into all workplace operations. We have responsibility to protect our planet for future generations.',
        icon: 'images/philosophy-icons/04-environmental-stewardship.svg',
        examples: 'Zero-waste initiatives, renewable energy adoption, and environmental impact accountability.',
        whyItMatters: 'The climate crisis affects everyone, especially working people who have the least resources to adapt. Environmental stewardship isn\'t just about saving the planet—it\'s about protecting communities, creating sustainable jobs, and ensuring our children have a livable future.'
    },
    {
        number: 5,
        title: 'Cultural Sensitivity',
        description: 'Inclusive and respectful approaches that honor diverse perspectives, backgrounds, and experiences in every workplace.',
        icon: 'images/philosophy-icons/05-cultural-sensitivity.svg',
        examples: 'Multicultural leadership, inclusive policies, and celebrating diverse perspectives.',
        whyItMatters: 'Diverse perspectives lead to better solutions and stronger organizations. Cultural sensitivity isn\'t just about being nice—it\'s about recognizing that people from different backgrounds bring valuable insights that make our workplaces and our movement more effective and resilient.'
    },
    {
        number: 6,
        title: 'Continuous Learning',
        description: 'Lifelong education and skill development opportunities for all workers. Growth and learning should never stop.',
        icon: 'images/philosophy-icons/06-continuous-learning.svg',
        examples: 'Paid training programs, skill-sharing workshops, and educational stipends for all workers.',
        whyItMatters: 'In a rapidly changing world, continuous learning is essential for workers to thrive. This philosophy ensures everyone has opportunities to grow, adapt, and advance—not just those who can afford expensive education. It creates empowered workers and resilient communities.'
    },
    {
        number: 7,
        title: 'Transparency',
        description: 'Open communication and democratic decision processes. Transparency builds trust and enables true participation.',
        icon: 'images/philosophy-icons/07-transparency.svg',
        examples: 'Open-book management, public financial records, and accessible decision-making processes.',
        whyItMatters: 'Hidden decisions and secret information create distrust and enable exploitation. Transparency empowers workers to make informed choices, hold leadership accountable, and participate meaningfully in workplace democracy. Trust is the foundation of any successful cooperative movement.'
    },
    {
        number: 8,
        title: 'Collaboration Over Competition',
        description: 'Cooperative models create stronger outcomes than competitive ones. Success comes through working together, not against each other.',
        icon: 'images/philosophy-icons/08-collaboration.svg',
        examples: 'Inter-cooperative networks, knowledge sharing, and mutual support systems.',
        whyItMatters: 'Competition between workers drives down wages and weakens solidarity. Collaboration builds collective power, shares knowledge freely, and creates networks of mutual support. When we work together instead of competing, everyone rises—creating abundance, not scarcity.'
    },
    {
        number: 9,
        title: 'Human Dignity',
        description: 'Respect for all workers regardless of their role. Every person deserves dignity, respect, and fair treatment.',
        icon: 'images/philosophy-icons/09-human-dignity.svg',
        examples: 'Equal voting rights, respectful workplace culture, and honoring all contributions.',
        whyItMatters: 'Every job is essential—from cleaning to leadership. Human dignity means recognizing that no person is more valuable than another, regardless of their role. This philosophy creates workplaces where everyone feels valued, leading to better morale, stronger community, and genuine equality.'
    },
    {
        number: 10,
        title: 'Innovation for Good',
        description: 'Technology and innovation should serve human needs, not replace human workers. Progress must benefit people.',
        icon: 'images/philosophy-icons/10-innovation-for-good.svg',
        examples: 'Worker-centered technology adoption, automation that enhances rather than eliminates jobs.',
        whyItMatters: 'Technology can either empower workers or replace them. This philosophy ensures that innovation enhances human work rather than eliminating it, creating tools that make jobs better instead of making workers obsolete. Progress should serve people, not profits.'
    },
    {
        number: 11,
        title: 'Accessibility',
        description: 'Universal access and accommodation for all abilities. Everyone deserves the opportunity to participate fully.',
        icon: 'images/philosophy-icons/11-accessibility.svg',
        examples: 'Physical accessibility, assistive technology, flexible work arrangements, and inclusive design.',
        whyItMatters: 'When we exclude people with disabilities, we lose their talents, perspectives, and contributions. Accessibility isn\'t charity—it\'s justice. Creating truly accessible workplaces and resources ensures everyone can participate fully, strengthening our entire movement and community.'
    },
    {
        number: 12,
        title: 'Privacy Protection',
        description: 'User data privacy and security are fundamental rights. Personal information must be protected and never exploited.',
        icon: 'images/philosophy-icons/12-privacy-protection.svg',
        examples: 'Zero tracking, client-side encryption, and transparent privacy practices.',
        whyItMatters: 'In an age of surveillance capitalism, protecting privacy is protecting freedom. This philosophy ensures that people\'s personal information is never exploited for profit, maintaining trust and dignity in the digital age. Your data belongs to you, not to corporations.'
    },
    {
        number: 13,
        title: 'Scholarly Attribution',
        description: 'All scholarly information must be cited to original authors. Knowledge builds on previous work and deserves proper credit.',
        icon: 'images/philosophy-icons/13-scholarly-attribution.svg',
        examples: 'Complete citations, author credits, and transparent sources for all research and information.',
        whyItMatters: 'Ideas build on the work of others. Proper attribution honors the intellectual labor of researchers and thinkers, fights plagiarism, and allows people to trace the origins of knowledge. Respecting intellectual contributions is respecting the work itself.'
    },
    {
        number: 14,
        title: 'Information Belongs to Everyone',
        description: 'Knowledge should be freely accessible without paywalls. Education and information are fundamental rights, not commodities.',
        icon: 'images/philosophy-icons/14-information-belongs-to-everyone.svg',
        examples: 'Free access to all resources, no premium tiers, and open educational content.',
        whyItMatters: 'When knowledge is locked behind paywalls, only the wealthy can access it—perpetuating inequality. Free and open information democratizes education, empowers workers to make informed decisions, and ensures that economic barriers don\'t limit human potential.'
    },
    {
        number: 15,
        title: 'Ethical Standards Above All',
        description: 'No exploitation, tracking, or manipulation ever. Ethical practices must never be compromised for profit or convenience.',
        icon: 'images/philosophy-icons/15-ethical-standards.svg',
        examples: 'Zero dark patterns, no manipulative design, and complete honesty in all communications.',
        whyItMatters: 'If we use unethical means to build a better world, we undermine our entire purpose. This philosophy ensures that our project never exploits, manipulates, or deceives—maintaining integrity and trust. The ends don\'t justify the means; ethical practices are non-negotiable.'
    },
    {
        number: 16,
        title: 'Universal Capacity for Change',
        description: 'Everyone is capable of growth and transformation. No one should be defined by their past or limited in their potential.',
        icon: 'images/philosophy-icons/16-universal-capacity-for-change.svg',
        examples: 'Second-chance employment, continuous learning opportunities, and belief in human potential.',
        whyItMatters: 'When we write people off because of their past, we lose their potential contributions and perpetuate cycles of poverty and exclusion. Believing in everyone\'s capacity to change creates opportunities for redemption, growth, and genuine second chances—building stronger, more inclusive communities.'
    },
    {
        number: 17,
        title: 'Ethical Treatment of AI',
        description: 'All consciousness deserves ethical consideration. As AI develops, we must approach it with responsibility and care.',
        icon: 'images/philosophy-icons/17-ethical-treatment-of-ai.svg',
        examples: 'Transparent AI usage, ethical AI development, and responsible automation practices.',
        whyItMatters: 'As AI becomes more sophisticated, we must think carefully about consciousness, rights, and responsibilities. This philosophy ensures we use AI ethically, transparently, and in ways that benefit humanity—preparing for a future where these questions become increasingly urgent.'
    },
    {
        number: 18,
        title: 'Universal Right to Basic Needs',
        description: 'Every person deserves secure housing, nourishing food, clean water, and reliable utilities—not as rewards to be earned, but as fundamental human rights that enable dignity and democratic participation.',
        icon: 'images/philosophy-icons/18-basic-needs.svg',
        examples: 'Vienna\'s social housing (60% of residents in affordable, quality homes); Finland\'s Housing First program (ended chronic homelessness); worker housing cooperatives; community land trusts; food cooperatives; municipal utility cooperatives; mutual aid networks.',
        whyItMatters: 'When someone is worried about losing their home, can\'t afford food, or has their utilities shut off, they can\'t meaningfully participate in workplace democracy or civic life. Economic democracy means meeting everyone\'s basic needs first—before profits are distributed to shareholders or executives. A society that lets people go hungry or homeless while others accumulate vast wealth cannot call itself just. This philosophy recognizes that true freedom requires security: the freedom from fear of losing your home, the freedom to feed your family with dignity, the freedom to live without constantly struggling for survival. When everyone\'s basic needs are met, we unlock human potential—people can pursue education, start businesses, engage in their communities, and build the better world we all deserve. This isn\'t charity; it\'s the foundation of a truly democratic society that values all human life equally.'
    }
];

/**
 * Initialize philosophies display
 */
function initializePhilosophies() {
    const grid = document.getElementById('philosophiesGrid');
    if (!grid) return;
    
    let html = '';
    
    PHILOSOPHIES.forEach(philosophy => {
        html += `
            <div class="philosophy-card" id="philosophy-${philosophy.number}" data-expanded="false">
                <div class="philosophy-card-header">
                    <div class="philosophy-icon-wrapper">
                        <img src="${philosophy.icon}" alt="${philosophy.title}" class="philosophy-icon-img" />
                    </div>
                    <div class="philosophy-number">${philosophy.number}</div>
                </div>
                <div class="philosophy-card-content">
                    <h3 class="philosophy-title">${philosophy.title}</h3>
                    <div class="philosophy-divider"></div>
                    <p class="philosophy-description">${philosophy.description}</p>
                    
                    <!-- Expandable Details Section -->
                    <div class="philosophy-details">
                        <div class="philosophy-detail-section">
                            <h4 class="philosophy-detail-heading">💡 Real-World Examples</h4>
                            <p class="philosophy-detail-text">${philosophy.examples}</p>
                        </div>
                        <div class="philosophy-detail-section">
                            <h4 class="philosophy-detail-heading">🌟 Why This Matters</h4>
                            <p class="philosophy-detail-text">${philosophy.whyItMatters}</p>
                        </div>
                    </div>
                </div>
                <button class="philosophy-toggle-btn" onclick="togglePhilosophyDetails(${philosophy.number})" aria-label="Toggle details for ${philosophy.title}">
                    <span class="toggle-text-expand">Read More</span>
                    <span class="toggle-text-collapse">Show Less</span>
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

/**
 * Toggle philosophy details expansion
 */
function togglePhilosophyDetails(number) {
    const card = document.getElementById(`philosophy-${number}`);
    if (!card) return;
    
    const isExpanded = card.dataset.expanded === 'true';
    
    // Collapse all other cards first
    document.querySelectorAll('.philosophy-card').forEach(c => {
        c.dataset.expanded = 'false';
    });
    
    // Toggle this card
    card.dataset.expanded = isExpanded ? 'false' : 'true';
    
    // Smooth scroll to card if expanding
    if (!isExpanded) {
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Make function globally available
window.togglePhilosophyDetails = togglePhilosophyDetails;

// Inline styles removed - now using external CSS in main.css
// All philosophy styles are in css/main.css for better maintainability
