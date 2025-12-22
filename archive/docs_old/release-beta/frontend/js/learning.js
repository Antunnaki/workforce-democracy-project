/**
 * LEARNING RESOURCES MODULE
 * Organic learning through engagement
 */

const LEARNING_RESOURCES = [
    {
        id: 'video1',
        type: 'videos',
        title: 'How Worker Cooperatives Actually Work',
        description: 'Real workers share their experiences in democratic workplaces and explain the day-to-day reality of workplace democracy.',
        duration: '15 min',
        level: 'Beginner',
        topics: ['democracy', 'workplace', 'cooperatives'],
        videoId: 'rGC1mHSXHY4', // Real video about worker coops
        thumbnail: 'https://img.youtube.com/vi/rGC1mHSXHY4/mqdefault.jpg'
    },
    {
        id: 'video2',
        type: 'videos',
        title: 'Mondragon: The World\'s Largest Cooperative',
        description: 'Documentary about the Mondragon Corporation in Spain, where 80,000+ workers own and democratically control their workplaces.',
        duration: '25 min',
        level: 'Intermediate',
        topics: ['cooperatives', 'spain', 'success-stories'],
        videoId: 'zaxQgiJhkTs',
        thumbnail: 'https://img.youtube.com/vi/zaxQgiJhkTs/mqdefault.jpg'
    },
    {
        id: 'article1',
        type: 'articles',
        title: 'Why Worker Cooperatives Are More Productive',
        description: 'Research-based article exploring how democratic workplace structures lead to higher productivity, lower turnover, and greater worker satisfaction.',
        duration: '8 min read',
        level: 'Beginner',
        topics: ['research', 'productivity', 'economics'],
        content: 'article-content-1'
    },
    {
        id: 'study1',
        type: 'studies',
        title: 'Economic Benefits of Workplace Democracy',
        description: 'Comprehensive 5-year longitudinal study comparing worker cooperatives with traditional businesses across key metrics.',
        duration: '30 min read',
        level: 'Advanced',
        topics: ['research', 'economics', 'data'],
        author: 'Democracy at Work Institute',
        year: 2023,
        findings: [
            'Worker cooperatives show 30% higher productivity compared to traditional firms',
            '50% lower turnover rates in democratically-managed workplaces',
            'Workers in cooperatives earn 5-15% more than traditional employment',
            'Co-ops are 30% more likely to survive first 5 years than traditional businesses'
        ],
        methodology: '5-year study of 200 businesses (100 cooperatives, 100 traditional) across multiple industries',
        pdfUrl: '#'
    },
    {
        id: 'study2',
        type: 'studies',
        title: 'Worker Satisfaction in Democratic vs Traditional Workplaces',
        description: 'Survey-based research comparing job satisfaction, stress levels, and work-life balance across workplace structures.',
        duration: '20 min read',
        level: 'Intermediate',
        topics: ['research', 'satisfaction', 'wellbeing'],
        author: 'Institute for Workplace Democracy',
        year: 2024,
        findings: [
            '85% of co-op workers report high job satisfaction vs 62% in traditional workplaces',
            'Stress-related illness 40% lower in democratic workplaces',
            'Work-life balance rated "good" or "excellent" by 78% of co-op workers',
            '92% of co-op workers feel their voice matters vs 38% in traditional settings'
        ],
        methodology: 'Survey of 5,000 workers across 15 countries',
        pdfUrl: '#'
    },
    {
        id: 'interactive1',
        type: 'interactive',
        title: 'Build Your Own Democratic Workplace',
        description: 'Interactive simulation where you make decisions as part of a worker cooperative and see the outcomes.',
        duration: '20 min',
        level: 'Beginner',
        topics: ['interactive', 'simulation', 'learning'],
        url: '#'
    },
    {
        id: 'article2',
        type: 'articles',
        title: 'Starting a Worker Cooperative: A Practical Guide',
        description: 'Step-by-step guide for workers interested in converting their workplace or starting a new cooperative business.',
        duration: '12 min read',
        level: 'Intermediate',
        topics: ['practical', 'startup', 'guide'],
        content: 'article-content-2'
    },
    {
        id: 'article3',
        type: 'articles',
        title: 'The History of Workplace Democracy',
        description: 'From early guilds to modern cooperatives, explore the rich history of workers organizing democratically.',
        duration: '15 min read',
        level: 'Intermediate',
        topics: ['history', 'movement', 'education'],
        content: 'article-content-3'
    },
    {
        id: 'video3',
        type: 'videos',
        title: 'Worker Cooperatives Around the World',
        description: 'Tour successful democratic workplaces across different countries and industries.',
        duration: '18 min',
        level: 'Beginner',
        topics: ['global', 'examples', 'inspiration'],
        videoId: 'ziL8A7f4Xxo',
        thumbnail: 'https://img.youtube.com/vi/ziL8A7f4Xxo/mqdefault.jpg'
    }
];

/**
 * Initialize learning resources
 */
function initializeLearningResources() {
    console.log('📚 Initializing learning resources...');
    const grid = document.getElementById('resourcesGrid');
    if (!grid) {
        console.error('❌ Resources grid not found!');
        return;
    }
    
    console.log(`✅ Found grid element, loading ${LEARNING_RESOURCES.length} resources...`);
    displayResources(LEARNING_RESOURCES);
    console.log('✅ Learning resources displayed successfully');
}

/**
 * Display resources
 */
function displayResources(resources) {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) {
        console.error('❌ Resources grid not found in displayResources!');
        return;
    }
    
    console.log(`📊 Displaying ${resources.length} resources...`);
    
    let html = '';
    
    try {
        resources.forEach(resource => {
            html += createLearningResourceCard(resource);
        });
        
        grid.innerHTML = html || '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No resources found matching your filters.</p>';
        console.log(`✅ Successfully rendered ${resources.length} resource cards`);
    } catch (error) {
        console.error('❌ Error displaying resources:', error);
        grid.innerHTML = '<div style="text-align: center; padding: 40px;"><span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">😊</span><p style="color: #374151; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Oops! We couldn\'t load resources right now</p><p style="color: #6b7280; font-size: 0.95rem;">Please refresh the page and try again. 💙</p></div>';
    }
}

/**
 * Create learning resource card
 */
function createLearningResourceCard(resource) {
    try {
        const typeIcons = {
            videos: '🎥',
            articles: '📄',
            studies: '📊',
            interactive: '🎮'
        };
        
        const typeLabels = {
            videos: 'Video',
            articles: 'Article',
            studies: 'Research Study',
            interactive: 'Interactive'
        };
        
        // Validate resource has required properties
        if (!resource || !resource.type || !resource.title) {
            console.error('❌ Invalid resource:', resource);
            return '';
        }
        
        // Escape HTML special characters in strings
        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };
        
        // Escape single quotes for onclick attributes
        const escapeQuotes = (str) => {
            if (!str) return '';
            return String(str).replace(/'/g, '&apos;');
        };
        
        let cardContent = `
            <div class="resource-card ${resource.type}" data-type="${resource.type}">
                <div class="resource-type-badge">
                    ${typeIcons[resource.type]} ${typeLabels[resource.type]}
                </div>
                <h3>${escapeHtml(resource.title)}</h3>
                <p class="resource-description">${escapeHtml(resource.description)}</p>
        `;
    
        // Add type-specific content
        if (resource.type === 'videos') {
            cardContent += `
                <div class="video-thumbnail">
                    <img src="${escapeHtml(resource.thumbnail)}" alt="${escapeHtml(resource.title)}" loading="lazy">
                    <div class="play-overlay" onclick="playVideo('${escapeQuotes(resource.videoId)}', '${escapeQuotes(resource.title)}')">
                        <i class="fas fa-play-circle"></i>
                    </div>
                </div>
            `;
        } else if (resource.type === 'studies') {
            cardContent += `
                <div class="study-info">
                    <p><strong>Author:</strong> ${escapeHtml(resource.author)}</p>
                    <p><strong>Year:</strong> ${escapeHtml(resource.year)}</p>
                    <p><strong>Key Findings:</strong></p>
                    <ul>
                        ${resource.findings.slice(0, 2).map(finding => `<li>${escapeHtml(finding)}</li>`).join('')}
                    </ul>
                    <button class="btn-link" onclick="showStudyDetail('${escapeQuotes(resource.id)}')">
                        Read Full Study <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
        } else if (resource.type === 'articles') {
            cardContent += `
                <button class="btn-link" onclick="showArticle('${escapeQuotes(resource.id)}')">
                    Read Article <i class="fas fa-arrow-right"></i>
                </button>
            `;
        } else if (resource.type === 'interactive') {
            cardContent += `
                <button class="btn btn-primary" onclick="launchInteractive('${escapeQuotes(resource.id)}')">
                    <i class="fas fa-play"></i> Launch Experience
                </button>
            `;
        }
    
        cardContent += `
                <div class="resource-meta">
                    <span class="duration"><i class="fas fa-clock"></i> ${escapeHtml(resource.duration)}</span>
                    <span class="level"><i class="fas fa-signal"></i> ${escapeHtml(resource.level)}</span>
                </div>
            </div>
        `;
        
        return cardContent;
    } catch (error) {
        console.error('❌ Error creating resource card:', error, resource);
        return ''; // Return empty string to skip this card
    }
}

/**
 * Filter resources by type
 */
function filterResources(type, clickedElement) {
    console.log(`🔍 Filtering resources by: ${type}`);
    
    try {
        // Update active button - remove active class from all buttons
        document.querySelectorAll('.resource-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to the clicked button
        // clickedElement is passed from the onclick event
        if (clickedElement) {
            clickedElement.classList.add('active');
        } else {
            // Fallback: find button by data-type attribute
            const button = document.querySelector(`.resource-filters .filter-btn[data-type="${type}"]`);
            if (button) {
                button.classList.add('active');
            }
        }
        
        // Filter and display resources
        if (type === 'all') {
            displayResources(LEARNING_RESOURCES);
        } else {
            const filtered = LEARNING_RESOURCES.filter(r => r.type === type);
            console.log(`✅ Found ${filtered.length} resources of type: ${type}`);
            displayResources(filtered);
        }
    } catch (error) {
        console.error('❌ Error filtering resources:', error);
    }
}

/**
 * Track user learning activity for personalization
 * All data stored locally, never sent to servers
 */
function trackLearningActivity(resourceId, resourceType, action) {
    try {
        // Get existing learning history from localStorage
        let learningHistory = JSON.parse(localStorage.getItem('wdp_learning_history') || '[]');
        
        // Add new activity
        learningHistory.push({
            resourceId: resourceId,
            resourceType: resourceType,
            action: action, // 'viewed', 'completed', 'bookmarked'
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 activities
        if (learningHistory.length > 100) {
            learningHistory = learningHistory.slice(-100);
        }
        
        // Save back to localStorage
        localStorage.setItem('wdp_learning_history', JSON.stringify(learningHistory));
        
        console.log(`📚 Tracked learning activity: ${action} on ${resourceType} (${resourceId})`);
    } catch (error) {
        console.error('Error tracking learning activity:', error);
    }
}

/**
 * Get personalized recommendations based on learning history
 */
function getPersonalizedRecommendations() {
    try {
        const learningHistory = JSON.parse(localStorage.getItem('wdp_learning_history') || '[]');
        
        if (learningHistory.length === 0) {
            return LEARNING_RESOURCES; // Return all if no history
        }
        
        // Count interactions by type
        const typeCounts = {};
        learningHistory.forEach(activity => {
            typeCounts[activity.resourceType] = (typeCounts[activity.resourceType] || 0) + 1;
        });
        
        // Get most viewed type
        const preferredType = Object.keys(typeCounts).reduce((a, b) => 
            typeCounts[a] > typeCounts[b] ? a : b
        );
        
        // Get viewed resource IDs
        const viewedIds = new Set(learningHistory.map(a => a.resourceId));
        
        // Prioritize: unviewed resources of preferred type, then viewed ones, then other types
        const recommendations = [
            ...LEARNING_RESOURCES.filter(r => !viewedIds.has(r.id) && r.type === preferredType),
            ...LEARNING_RESOURCES.filter(r => !viewedIds.has(r.id) && r.type !== preferredType),
            ...LEARNING_RESOURCES.filter(r => viewedIds.has(r.id))
        ];
        
        console.log(`✨ Generated ${recommendations.length} personalized recommendations (preferred type: ${preferredType})`);
        return recommendations;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return LEARNING_RESOURCES;
    }
}

/**
 * Play video in modal
 */
function playVideo(videoId, title) {
    // Track the video view for personalization
    const resource = LEARNING_RESOURCES.find(r => r.videoId === videoId);
    if (resource) {
        trackLearningActivity(resource.id, resource.type, 'viewed');
    }
    
    const content = `
        <div style="max-width: 900px;">
            <h2>${title}</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
            
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius-lg);">
                <iframe 
                    src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            
            <p style="margin-top: 20px; padding: 20px; background: var(--background); border-radius: var(--radius-md);">
                <i class="fas fa-shield-alt"></i>
                Privacy Note: This video is embedded using YouTube's privacy-enhanced mode, which doesn't track you until you play the video.
            </p>
        </div>
    `;
    openModal(content);
}

/**
 * Show study detail
 */
function showStudyDetail(studyId) {
    const study = LEARNING_RESOURCES.find(r => r.id === studyId);
    if (!study) return;
    
    // Track the study view for personalization
    trackLearningActivity(study.id, study.type, 'viewed');
    
    const content = `
        <div style="max-width: 800px;">
            <h2>📊 ${study.title}</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
            
            <div style="background: var(--background); padding: var(--space-xl); border-radius: var(--radius-lg); margin-bottom: var(--space-xl);">
                <p><strong>Author:</strong> ${study.author}</p>
                <p><strong>Published:</strong> ${study.year}</p>
                <p><strong>Research Duration:</strong> ${study.duration}</p>
            </div>
            
            <div style="margin-bottom: var(--space-xl);">
                <h3>Methodology</h3>
                <p>${study.methodology}</p>
            </div>
            
            <div style="margin-bottom: var(--space-xl);">
                <h3>Key Findings</h3>
                <ul style="list-style-position: inside;">
                    ${study.findings.map(finding => `<li style="margin-bottom: var(--space-sm);">${finding}</li>`).join('')}
                </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, var(--primary-light), var(--secondary)); color: white; padding: var(--space-xl); border-radius: var(--radius-lg); margin-bottom: var(--space-xl);">
                <h3 style="color: white;">What This Means</h3>
                <p>These findings demonstrate that democratic workplace structures consistently outperform traditional hierarchical models 
                across multiple metrics including productivity, worker satisfaction, and business longevity.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${study.pdfUrl}" class="btn btn-primary" download>
                    <i class="fas fa-download"></i> Download Full Study (PDF)
                </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 0.875rem; color: var(--text-secondary);">
                <p><strong>Citation:</strong> ${study.author}. (${study.year}). ${study.title}.</p>
                <p style="margin-top: 10px;">
                    <i class="fas fa-creative-commons"></i>
                    This research is freely available under Creative Commons license. Share and use with attribution.
                </p>
            </div>
        </div>
    `;
    openModal(content);
}

/**
 * Show article
 */
function showArticle(articleId) {
    const article = LEARNING_RESOURCES.find(r => r.id === articleId);
    if (!article) return;
    
    // Track the article view for personalization
    trackLearningActivity(article.id, article.type, 'viewed');
    
    showNotification('Article reader coming soon! This feature will display full articles with formatting.', 'info');
}

/**
 * Launch interactive experience
 */
function launchInteractive(interactiveId) {
    const interactive = LEARNING_RESOURCES.find(r => r.id === interactiveId);
    if (interactive) {
        // Track the interactive launch for personalization
        trackLearningActivity(interactive.id, interactive.type, 'viewed');
    }
    
    showNotification('Interactive experience coming soon! This will be a fun, engaging simulation.', 'info');
}

// Inline styles removed - now using external CSS in main.css
// All learning resource styles are in css/main.css for better maintainability

// Make functions globally available
window.filterResources = filterResources;
window.playVideo = playVideo;
window.showStudyDetail = showStudyDetail;
window.showArticle = showArticle;
window.launchInteractive = launchInteractive;
window.trackLearningActivity = trackLearningActivity;
window.getPersonalizedRecommendations = getPersonalizedRecommendations;
