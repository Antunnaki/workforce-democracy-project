/**
 * Unified Onboarding Experience
 * V33.0.0 - Privacy-First, Philosophy-Aligned Design
 * 
 * This replaces:
 * - Old guided tour modal (js/main.js - initializeGuidedTour, showGuidedTour)
 * - Old personalization modal (js/personalization.js - checkPersonalizationChoice)
 * 
 * Features:
 * - Single 5-step onboarding flow
 * - Personalization question only in final step (no duplication)
 * - No annoying toast notifications
 * - Inline success feedback instead
 * - localStorage management for "don't show again"
 * - Respects user privacy choices
 */

// State management
const OnboardingState = {
    currentStep: 1,
    totalSteps: 5,
    hasSeenOnboarding: false,
    completedSteps: new Set()
};

/**
 * Initialize unified onboarding on page load
 */
function initializeUnifiedOnboarding() {
    console.log('[V33.0.0 Unified Onboarding] Initializing...');
    
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem('wdp_unified_onboarding_seen');
    const hasPersonalization = localStorage.getItem('wdp_personalization_choice');
    
    console.log('[Unified Onboarding] hasSeenOnboarding:', hasSeenOnboarding);
    console.log('[Unified Onboarding] hasPersonalization:', hasPersonalization);
    
    // Don't show if user has completed onboarding before
    if (hasSeenOnboarding === 'true') {
        console.log('[Unified Onboarding] ℹ️ User has already completed onboarding - skipping');
        return;
    }
    
    console.log('[Unified Onboarding] ✅ First-time user - showing onboarding shortly...');
    
    // Show onboarding after slight delay for smooth render (prevents janky appearance)
    setTimeout(() => {
        showUnifiedOnboarding();
    }, 1000);
}

/**
 * Show the unified onboarding modal
 */
function showUnifiedOnboarding() {
    // Create modal HTML
    const modalHTML = `
        <div class="unified-onboarding-overlay" id="unifiedOnboardingOverlay">
            <div class="unified-onboarding-modal" role="dialog" aria-labelledby="onboardingTitle" aria-modal="true">
                
                <!-- Header -->
                <div class="onboarding-header">
                    <button class="onboarding-close" onclick="closeUnifiedOnboarding()" aria-label="Close onboarding">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;">
                            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <h2 id="onboardingTitle">
                        <span>👋</span>
                        <span>Welcome!</span>
                    </h2>
                    <p>Quick tour of key features</p>
                </div>

                <!-- Body -->
                <div class="onboarding-body">
                    
                    <!-- Step 1: Welcome -->
                    <div class="onboarding-step active" id="onboardingStep1">
                        <h3>Welcome!</h3>
                        <p>Track government transparency, explore democratic jobs, and find ethical businesses.</p>
                        
                        <div class="feature-cards">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="60" height="60" rx="8" fill="#667eea"/>
                                        <path d="M15 50 L15 22 L30 12 L45 22 L45 50 Z" fill="white" opacity="0.9"/>
                                        <rect x="25" y="32" width="10" height="18" fill="#f4a261"/>
                                        <rect x="18" y="28" width="6" height="8" fill="#f4a261" opacity="0.8"/>
                                        <rect x="36" y="28" width="6" height="8" fill="#f4a261" opacity="0.8"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4>Civic Engagement</h4>
                                    <p>Track reps & bills</p>
                                </div>
                            </div>

                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="60" height="60" rx="8" fill="#f4a261"/>
                                        <circle cx="30" cy="18" r="8" fill="white" opacity="0.9"/>
                                        <path d="M18 32 Q18 28 22 26 L30 24 L38 26 Q42 28 42 32 L42 45 L18 45 Z" fill="white" opacity="0.9"/>
                                        <rect x="22" y="35" width="16" height="10" rx="2" fill="#667eea"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4>Democratic Jobs</h4>
                                    <p>230+ professions</p>
                                </div>
                            </div>

                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="60" height="60" rx="8" fill="#4caf50"/>
                                        <rect x="10" y="18" width="40" height="6" rx="1" fill="#f4a261"/>
                                        <rect x="12" y="24" width="36" height="28" rx="2" fill="white" opacity="0.9"/>
                                        <rect x="16" y="30" width="12" height="9" fill="#4caf50" opacity="0.5"/>
                                        <rect x="32" y="30" width="12" height="9" fill="#4caf50" opacity="0.5"/>
                                        <rect x="16" y="41" width="12" height="9" fill="#4caf50" opacity="0.5"/>
                                        <rect x="32" y="41" width="12" height="9" fill="#4caf50" opacity="0.5"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4>Ethical Businesses</h4>
                                    <p>Co-ops & B-Corps</p>
                                </div>
                            </div>

                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="60" height="60" rx="8" fill="#667eea"/>
                                        <rect x="15" y="12" width="30" height="36" rx="2" fill="white" opacity="0.9"/>
                                        <rect x="20" y="18" width="20" height="2.5" rx="1" fill="#667eea"/>
                                        <rect x="20" y="24" width="20" height="2.5" rx="1" fill="#667eea"/>
                                        <rect x="20" y="30" width="15" height="2.5" rx="1" fill="#667eea"/>
                                        <rect x="20" y="36" width="20" height="2.5" rx="1" fill="#667eea"/>
                                        <circle cx="30" cy="44" r="2" fill="#f4a261"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4>Learning Center</h4>
                                    <p>Videos & research</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Civic Engagement -->
                    <div class="onboarding-step" id="onboardingStep2">
                        <h3>Civic Transparency</h3>
                        <p>Track representatives and vote on bills.</p>
                        
                        <ul class="feature-list">
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Track voting records</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Vote on bills yourself</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>AI explanations of legislation</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Chat with Civic Assistant</span>
                            </li>
                        </ul>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="60" height="60" rx="8" fill="#4caf50"/>
                                    <path d="M30 8 L14 18 L14 32 Q14 42 30 52 Q46 42 46 32 L46 18 Z" fill="white" opacity="0.9"/>
                                    <circle cx="30" cy="28" r="6" fill="#4caf50"/>
                                </svg>
                            </div>
                            <div>
                                <h4>Privacy First</h4>
                                <p>Data stays on your device. Never tracked or sold.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Democratic Jobs -->
                    <div class="onboarding-step" id="onboardingStep3">
                        <h3>Democratic Jobs</h3>
                        <p>Compare traditional vs democratic workplaces.</p>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="60" height="60" rx="8" fill="#667eea"/>
                                    <circle cx="30" cy="25" r="12" fill="white" opacity="0.9" stroke="#f4a261" stroke-width="3"/>
                                    <rect x="20" y="40" width="20" height="3" fill="white" opacity="0.9"/>
                                    <text x="30" y="28" text-anchor="middle" font-size="10" fill="#667eea" font-weight="bold">230+</text>
                                </svg>
                            </div>
                            <div>
                                <h4>230+ Professions</h4>
                                <p>Side-by-side comparisons</p>
                            </div>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="60" height="60" rx="8" fill="#f4a261"/>
                                    <rect x="15" y="20" width="30" height="32" rx="3" fill="white" opacity="0.9"/>
                                    <circle cx="20" cy="8" r="3" fill="#667eea"/>
                                    <rect x="18" y="11" width="4" height="9" fill="#667eea"/>
                                    <circle cx="22" cy="30" r="2.5" fill="#4caf50"/>
                                    <circle cx="30" cy="30" r="2.5" fill="#4caf50"/>
                                    <circle cx="38" cy="30" r="2.5" fill="#4caf50"/>
                                    <path d="M20 38 Q26 42 32 38 Q38 42 44 38" stroke="#667eea" stroke-width="2" fill="none" stroke-linecap="round"/>
                                </svg>
                            </div>
                            <div>
                                <h4>AI Job Assistant</h4>
                                <p>Career-specific answers</p>
                            </div>
                        </div>

                        <ul class="feature-list">
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Worker ownership models</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Real-world examples</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                    <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                    <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Benefits & challenges</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Step 4: Ethical Business & Learning -->
                    <div class="onboarding-step" id="onboardingStep4">
                        <h3>Businesses & Learning</h3>
                        <p>Find local co-ops and educational resources.</p>
                        
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="60" height="60" rx="8" fill="#4caf50"/>
                                    <path d="M30 8 L22 20 L30 48 L38 20 Z" fill="#f4a261"/>
                                    <circle cx="30" cy="48" r="6" fill="white" opacity="0.9"/>
                                    <circle cx="30" cy="30" r="18" fill="white" opacity="0.15"/>
                                </svg>
                            </div>
                            <div>
                                <h4>Business Finder</h4>
                                <p>Co-ops & B-Corps near you</p>
                            </div>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="60" height="60" rx="8" fill="#667eea"/>
                                    <rect x="12" y="10" width="36" height="40" rx="2" fill="white" opacity="0.9"/>
                                    <rect x="16" y="16" width="28" height="3" rx="1" fill="#667eea"/>
                                    <rect x="16" y="23" width="28" height="3" rx="1" fill="#667eea"/>
                                    <rect x="16" y="30" width="20" height="3" rx="1" fill="#667eea"/>
                                    <rect x="16" y="37" width="28" height="3" rx="1" fill="#667eea"/>
                                    <circle cx="30" cy="45" r="2.5" fill="#f4a261"/>
                                </svg>
                            </div>
                            <div>
                                <h4>Learning Center</h4>
                                <p>Videos, research & FAQs</p>
                            </div>
                        </div>
                    </div>

                    <!-- Step 5: Privacy-First Personalization -->
                    <div class="onboarding-step" id="onboardingStep5">
                        <h3>Personalize (Optional)</h3>
                        <p>Get local recommendations with privacy guaranteed.</p>
                        
                        <div class="postcode-section">
                            <label for="onboardingPostcode">
                                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;">
                                    <path d="M10 2 L8 6 L10 14 L12 6 Z" fill="#f4a261"/>
                                    <circle cx="10" cy="14" r="2" fill="#667eea"/>
                                </svg>
                                Your Postcode (Optional)
                            </label>
                            <p>Find local reps, businesses & events.</p>
                            <div class="postcode-input-wrapper">
                                <input 
                                    type="text" 
                                    id="onboardingPostcode" 
                                    placeholder="e.g., SW1A 1AA or 90210"
                                    aria-label="Enter your postcode or ZIP code"
                                />
                            </div>
                        </div>

                        <div class="privacy-guarantee">
                            <div class="privacy-guarantee-header">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; margin-right: 10px;">
                                    <rect x="8" y="10" width="8" height="10" rx="1" fill="#4caf50"/>
                                    <path d="M9 10 L9 7 Q9 4 12 4 Q15 4 15 7 L15 10" stroke="#4caf50" fill="none" stroke-width="2"/>
                                    <circle cx="12" cy="15" r="1.5" fill="white"/>
                                </svg>
                                <h4>Privacy Guaranteed</h4>
                            </div>
                            <ul>
                                <li>
                                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                        <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                        <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Data stays on <strong>YOUR device</strong></span>
                                </li>
                                <li>
                                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                        <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                        <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Encrypted in browser only</span>
                                </li>
                                <li>
                                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                        <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                        <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Never tracked or sold</span>
                                </li>
                                <li>
                                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="min-width: 20px; width: 20px; height: 20px;">
                                        <circle cx="10" cy="10" r="9" fill="#4caf50"/>
                                        <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Change or delete anytime</span>
                                </li>
                            </ul>
                        </div>

                        <p style="text-align: center; color: #666; font-size: 0.9rem; margin-top: 1rem;">
                            <em>Enable anytime from Privacy page.</em>
                        </p>
                    </div>

                    <!-- Progress Indicators -->
                    <div class="onboarding-progress" role="tablist" aria-label="Onboarding progress">
                        <button class="progress-dot active" onclick="goToOnboardingStep(1)" role="tab" aria-label="Step 1" aria-selected="true"></button>
                        <button class="progress-dot" onclick="goToOnboardingStep(2)" role="tab" aria-label="Step 2" aria-selected="false"></button>
                        <button class="progress-dot" onclick="goToOnboardingStep(3)" role="tab" aria-label="Step 3" aria-selected="false"></button>
                        <button class="progress-dot" onclick="goToOnboardingStep(4)" role="tab" aria-label="Step 4" aria-selected="false"></button>
                        <button class="progress-dot" onclick="goToOnboardingStep(5)" role="tab" aria-label="Step 5" aria-selected="false"></button>
                    </div>

                    <!-- Action Buttons -->
                    <div class="onboarding-actions">
                        <button class="onboarding-btn onboarding-btn-ghost" id="onboardingBackBtn" onclick="previousOnboardingStep()" style="display: none;">
                            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-right: 6px;">
                                <path d="M12 4 L6 10 L12 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Back
                        </button>
                        <button class="onboarding-btn onboarding-btn-primary" id="onboardingNextBtn" onclick="nextOnboardingStep()">
                            Next
                            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-left: 6px;">
                                <path d="M8 4 L14 10 L8 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Skip Link -->
                    <div class="skip-link">
                        <button onclick="skipOnboarding()">Skip for now</button>
                    </div>

                </div>
            </div>
        </div>
    `;

    // Insert modal into page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Initialize state
    OnboardingState.currentStep = 1;
    OnboardingState.completedSteps.clear();
}

/**
 * Navigate to specific step
 */
function goToOnboardingStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > OnboardingState.totalSteps) return;

    // Hide all steps
    for (let i = 1; i <= OnboardingState.totalSteps; i++) {
        const step = document.getElementById(`onboardingStep${i}`);
        if (step) step.classList.remove('active');
    }

    // Show target step
    const targetStep = document.getElementById(`onboardingStep${stepNumber}`);
    if (targetStep) targetStep.classList.add('active');

    // Update progress dots
    const dots = document.querySelectorAll('.onboarding-progress .progress-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
        
        if (index + 1 === stepNumber) {
            dot.classList.add('active');
            dot.setAttribute('aria-selected', 'true');
        }
        
        if (OnboardingState.completedSteps.has(index + 1)) {
            dot.classList.add('completed');
        }
    });

    // Update buttons
    const backBtn = document.getElementById('onboardingBackBtn');
    const nextBtn = document.getElementById('onboardingNextBtn');

    if (backBtn) {
        backBtn.style.display = stepNumber === 1 ? 'none' : 'flex';
    }

    if (nextBtn) {
        if (stepNumber === OnboardingState.totalSteps) {
            nextBtn.innerHTML = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-right: 6px;"><circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.3"/><path d="M6 10 L9 13 L14 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> Get Started';
            nextBtn.className = 'onboarding-btn onboarding-btn-secondary';
        } else {
            nextBtn.innerHTML = 'Next <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-left: 6px;"><path d="M8 4 L14 10 L8 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            nextBtn.className = 'onboarding-btn onboarding-btn-primary';
        }
    }

    // Update state
    OnboardingState.currentStep = stepNumber;
    OnboardingState.completedSteps.add(stepNumber);
}

/**
 * Next step
 */
function nextOnboardingStep() {
    if (OnboardingState.currentStep === OnboardingState.totalSteps) {
        // Final step - handle personalization and finish
        finishOnboarding();
    } else {
        goToOnboardingStep(OnboardingState.currentStep + 1);
    }
}

/**
 * Previous step
 */
function previousOnboardingStep() {
    if (OnboardingState.currentStep > 1) {
        goToOnboardingStep(OnboardingState.currentStep - 1);
    }
}

/**
 * Skip onboarding
 */
function skipOnboarding() {
    if (confirm('Are you sure you want to skip the tour? You can always access it later from the Help menu.')) {
        closeUnifiedOnboarding();
        // Mark as seen so it doesn't show again
        localStorage.setItem('wdp_unified_onboarding_seen', 'true');
    }
}

/**
 * Close onboarding modal
 */
function closeUnifiedOnboarding() {
    const overlay = document.getElementById('unifiedOnboardingOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * Finish onboarding
 */
function finishOnboarding() {
    // Get postcode if provided
    const postcodeInput = document.getElementById('onboardingPostcode');
    const postcode = postcodeInput ? postcodeInput.value.trim() : '';

    // Save personalization choice
    if (postcode) {
        localStorage.setItem('wdp_personalization_choice', 'enabled');
        localStorage.setItem('wdp_user_postcode', postcode);
        
        // Show inline success message (no annoying toast!)
        showInlineSuccess();
        
        // Wait a moment before closing
        setTimeout(() => {
            completeOnboarding();
        }, 2000);
    } else {
        // User chose not to personalize
        localStorage.setItem('wdp_personalization_choice', 'disabled');
        completeOnboarding();
    }
}

/**
 * Show inline success message (replaces annoying toast notification)
 */
function showInlineSuccess() {
    const step5 = document.getElementById('onboardingStep5');
    if (!step5) return;

    // Remove action buttons
    const actions = document.querySelector('.onboarding-actions');
    const skipLink = document.querySelector('.skip-link');
    if (actions) actions.style.display = 'none';
    if (skipLink) skipLink.style.display = 'none';

    // Insert success message
    const successHTML = `
        <div class="inline-success">
            <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="width: 50px; height: 50px; margin-right: 15px;">
                <circle cx="30" cy="30" r="28" fill="#4caf50"/>
                <path d="M15 30 L25 40 L45 20" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="inline-success-content">
                <h4>✨ Personalization Enabled!</h4>
                <p>Data encrypted on your device only.</p>
            </div>
        </div>
    `;
    step5.insertAdjacentHTML('beforeend', successHTML);
}

/**
 * Complete onboarding and close
 */
function completeOnboarding() {
    // Mark as seen
    localStorage.setItem('wdp_unified_onboarding_seen', 'true');
    
    // Close modal
    closeUnifiedOnboarding();
    
    // If personalization enabled, trigger any necessary updates
    if (localStorage.getItem('wdp_personalization_choice') === 'enabled') {
        // Call existing personalization update functions if they exist
        if (typeof updatePersonalizedContent === 'function') {
            updatePersonalizedContent();
        }
    }
}

/**
 * Reset onboarding (for testing or user preference)
 */
function resetUnifiedOnboarding() {
    localStorage.removeItem('wdp_unified_onboarding_seen');
    console.log('[Unified Onboarding] Reset complete. Reload page to see onboarding again.');
}

// Add CSS animation for fade out
const onboardingStyle = document.createElement('style');
onboardingStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(onboardingStyle);

// ===== V33.0.1: RACE CONDITION FIX =====
// DO NOT auto-initialize here! This caused race conditions.
// Instead, initializeUnifiedOnboarding() is called from main.js's single DOMContentLoaded listener
// This ensures predictable initialization order and prevents the "stop load + refresh" bug

// Old code (caused race condition):
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeUnifiedOnboarding);
// } else {
//     initializeUnifiedOnboarding();
// }

// Make functions globally available for onclick handlers
window.goToOnboardingStep = goToOnboardingStep;
window.nextOnboardingStep = nextOnboardingStep;
window.previousOnboardingStep = previousOnboardingStep;
window.skipOnboarding = skipOnboarding;
window.closeUnifiedOnboarding = closeUnifiedOnboarding;
window.resetUnifiedOnboarding = resetUnifiedOnboarding;
