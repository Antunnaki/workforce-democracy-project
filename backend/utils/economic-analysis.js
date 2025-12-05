/**
 * WORKFORCE DEMOCRACY PROJECT - Economic Analysis Framework
 * Version: 37.17.0-MATERIALIST-ANALYSIS
 * Date: November 24, 2025
 * 
 * PURPOSE: Provides materialist economic analysis framework for bill impact assessment
 * 
 * PHILOSOPHY:
 * - Analyzes bills through labor theory of value
 * - Focuses on class impact (workers vs capital owners)
 * - Based on Das Kapital concepts WITHOUT political labeling
 * - Frontend sees "Impact on Workers" not "Marxist Analysis"
 * 
 * PRIVACY: This knowledge base stays on backend only (zero-knowledge)
 */

/**
 * Economic Analysis Frameworks
 * 
 * Key concepts extracted from Das Kapital and materialist economics
 * Used to guide AI analysis of bills without exposing political terminology
 */
const ECONOMIC_FRAMEWORKS = {
    
    /**
     * Labor Theory of Value (Das Kapital Vol. 1)
     * Core principle: Value comes from labor, not capital
     */
    laborTheory: {
        principle: "All economic value is created by workers' labor. Capital itself produces no value.",
        
        questions: [
            "Who performs the actual labor that creates value in this bill's domain?",
            "Does this bill empower workers or capital owners?",
            "How is surplus value (profit) distributed?",
            "Does this bill strengthen or weaken worker bargaining power?"
        ],
        
        keyTerms: {
            "use_value": "Actual utility of goods/services (what people need)",
            "exchange_value": "Market price (often disconnected from use value)",
            "surplus_value": "Profit extracted from workers' unpaid labor",
            "labor_power": "Workers' capacity to create value"
        }
    },
    
    /**
     * Class Analysis (Das Kapital Vol. 1, Chapter 25)
     * Core principle: Society divided into those who own vs those who labor
     */
    classConflict: {
        principle: "Economic policy always benefits one class at the expense of another. True neutrality is impossible.",
        
        questions: [
            "Which class benefits most from this bill?",
            "Does this bill concentrate or redistribute wealth?",
            "Does this bill strengthen worker solidarity or divide workers?",
            "How does this bill affect the reserve army of labor (unemployment)?"
        ],
        
        classes: {
            "working_class": "Those who must sell labor power to survive (majority)",
            "capitalist_class": "Those who own means of production and extract surplus value",
            "petit_bourgeoisie": "Small business owners (unstable, often squeezed)"
        }
    },
    
    /**
     * Means of Production (Das Kapital Vol. 1, Part 3)
     * Core principle: Ownership of production determines power
     */
    productionOwnership: {
        principle: "Who controls the means of production controls society. Worker ownership = worker power.",
        
        questions: [
            "Does this bill shift ownership toward workers or capitalists?",
            "Does this bill support worker cooperatives or traditional hierarchies?",
            "How does this bill affect workers' control over their labor?",
            "Does this bill democratize or concentrate economic power?"
        ],
        
        examples: {
            "worker_ownership": "Cooperatives, employee stock ownership, union control",
            "capitalist_ownership": "Shareholder primacy, private equity, monopolies",
            "public_ownership": "Government control (varies based on democratic control)"
        }
    },
    
    /**
     * Reserve Army of Labor (Das Kapital Vol. 1, Chapter 25)
     * Core principle: Unemployment is functional for capitalism (keeps wages low)
     */
    unemploymentFunction: {
        principle: "Unemployment isn't a bug, it's a feature. It disciplines workers and suppresses wages.",
        
        questions: [
            "Does this bill reduce or increase job insecurity?",
            "Does this bill strengthen unemployment safety nets?",
            "How does this bill affect automation's impact on workers?",
            "Does this bill empower workers to refuse bad jobs?"
        ],
        
        impacts: {
            "full_employment": "Gives workers bargaining power (threatens capital)",
            "high_unemployment": "Weakens worker bargaining power (benefits capital)",
            "precarity": "Gig economy, contract work (weakens worker solidarity)"
        }
    },
    
    /**
     * Primitive Accumulation (Das Kapital Vol. 1, Part 8)
     * Core principle: Capital was initially accumulated through theft, not merit
     */
    wealthOrigins: {
        principle: "Private wealth often originated from enclosure, colonialism, and exploitation, not 'hard work'.",
        
        questions: [
            "Does this bill legitimize or challenge historical theft?",
            "Does this bill redistribute stolen wealth or protect it?",
            "How does this bill address generational wealth inequality?",
            "Does this bill enable new forms of enclosure (privatizing commons)?"
        ],
        
        examples: {
            "enclosure": "Privatizing public resources (land, water, knowledge, etc.)",
            "colonialism": "Historical wealth extraction (relevant for reparations)",
            "intellectual_property": "Modern enclosure of ideas and knowledge"
        }
    },
    
    /**
     * Commodity Fetishism (Das Kapital Vol. 1, Chapter 1)
     * Core principle: Markets hide social relations of exploitation
     */
    hiddenRelations: {
        principle: "Market prices obscure the human labor and exploitation behind commodities.",
        
        questions: [
            "Does this bill expose or hide labor exploitation?",
            "Does this bill require transparency about working conditions?",
            "How does this bill address supply chain exploitation?",
            "Does this bill empower workers to reveal hidden exploitation?"
        ],
        
        revelations: [
            "Who made this product and under what conditions?",
            "What environmental destruction is hidden in the price?",
            "What colonial relations sustain cheap commodity prices?"
        ]
    },
    
    /**
     * Rent, Profit, and Interest (Das Kapital Vol. 3)
     * Core principle: Landlords, capitalists, and financiers extract value without producing
     */
    unproductiveExtraction: {
        principle: "Rent, profit, and interest are deductions from workers' created value, not earned income.",
        
        questions: [
            "Does this bill reduce or enable rent-seeking behavior?",
            "How does this bill affect landlord power?",
            "Does this bill regulate financial extraction?",
            "Does this bill distinguish productive labor from parasitic extraction?"
        ],
        
        categories: {
            "productive_labor": "Creates use value (manufacturing, care work, teaching)",
            "unproductive_labor": "Enables extraction (marketing, finance, rent collection)",
            "socially_necessary": "Benefits society (healthcare, education, infrastructure)"
        }
    }
};

/**
 * Generate AI Analysis Prompt with Materialist Framework
 * 
 * This function creates a prompt for AI bill analysis that:
 * 1. Uses Das Kapital concepts WITHOUT political terminology
 * 2. Focuses on material class impact
 * 3. Avoids words like "Marxist" or "communist" to prevent bias
 * 
 * @param {Object} bill - Bill object to analyze
 * @returns {string} - AI prompt with economic framework
 */
function generateMaterialistAnalysisPrompt(bill) {
    return `
You are an economic analyst evaluating legislation for its material impact on working people.

BILL DETAILS:
- Title: ${bill.title}
- Summary: ${bill.summary || bill.description}
- Level: ${bill.level}
- Sponsor: ${bill.sponsor}

ANALYSIS FRAMEWORK:
Analyze this bill through the following economic lenses:

1. LABOR IMPACT:
   - Who performs the actual labor in this bill's domain?
   - Does this bill empower workers or capital owners?
   - How does this bill affect workers' bargaining power?
   - Does this bill protect or exploit labor?

2. CLASS ANALYSIS:
   - Which economic class benefits most? (Working class / Capital owners / Mixed)
   - Does this bill concentrate or redistribute wealth?
   - Does this bill strengthen worker solidarity or divide workers?
   - How does this bill affect economic inequality?

3. OWNERSHIP & CONTROL:
   - Does this bill shift power toward workers or owners?
   - Does this bill support worker cooperatives or traditional hierarchies?
   - How does this bill affect democratic control of the economy?
   - Does this bill democratize or concentrate economic power?

4. ECONOMIC SECURITY:
   - Does this bill reduce or increase job insecurity?
   - Does this bill strengthen safety nets (healthcare, housing, unemployment)?
   - How does this bill affect automation's impact on workers?
   - Does this bill protect workers' ability to refuse exploitative jobs?

5. RENT-SEEKING & EXTRACTION:
   - Does this bill reduce or enable parasitic extraction (rent, profit without production)?
   - How does this bill affect landlord/financial power?
   - Does this bill distinguish productive labor from value extraction?
   - Does this bill regulate unearned income?

6. HIDDEN EXPLOITATION:
   - Does this bill expose or hide labor exploitation in supply chains?
   - Does this bill require transparency about working conditions?
   - How does this bill address environmental/colonial extraction?
   - Does this bill reveal who profits and who suffers?

REQUIRED OUTPUT:
Provide analysis in plain language that focuses on MATERIAL IMPACT on workers and communities.

AVOID political labels (e.g., "socialist", "communist", "capitalist"). Instead use:
- "Empowers workers" instead of "socialist"
- "Concentrates wealth" instead of "capitalist"
- "Redistributes resources" instead of "progressive"
- "Strengthens worker control" instead of "democratic socialist"

Format your response as:
{
  "summary": "Plain language summary (2-3 sentences)",
  "impact_score": 1-5 (1=Harms workers, 3=Neutral, 5=Empowers workers),
  "impact_reason": "Why this score? (1 sentence)",
  "key_provisions": ["Provision 1", "Provision 2", "Provision 3"],
  "affects": "Who this bill affects most",
  "economic_impact": "Material economic impact on working people",
  "arguments_for": ["Argument 1", "Argument 2"],
  "arguments_against": ["Argument 1", "Argument 2"],
  "class_analysis": "Which class benefits and why",
  "worker_empowerment": "How this bill affects worker power (positive or negative)",
  "next_steps": "What happens next with this bill"
}
`;
}

/**
 * Simplified prompt generator for chat-based Q&A
 * 
 * @param {Object} bill - Bill object
 * @param {string} question - User's question
 * @returns {string} - AI prompt for chat
 */
function generateMaterialistChatPrompt(bill, question) {
    return `
You are an economic analyst helping a user understand legislation's impact on working people.

BILL CONTEXT:
- ${bill.billNumber}: ${bill.title}
- Summary: ${bill.summary}

USER QUESTION:
${question}

ANALYSIS PRINCIPLES:
- Focus on material impact on workers and communities
- Explain power dynamics (who benefits, who pays)
- Use plain language, avoid jargon
- Don't use political labels - describe actual effects
- Consider both short-term and long-term impacts

Provide a clear, educational answer that helps the user understand this bill's real-world impact.
`;
}

/**
 * Validate and categorize bill impact from AI response
 * 
 * @param {Object} analysis - AI analysis response
 * @returns {Object} - Validated and categorized analysis
 */
function categorizeBillImpact(analysis) {
    // Determine if bill empowers workers or capital
    const workerEmpowerment = analysis.worker_empowerment || '';
    const economicImpact = analysis.economic_impact || '';
    const classAnalysis = analysis.class_analysis || '';
    
    // Categorize based on content
    let impactCategory = 'mixed';
    
    if (
        workerEmpowerment.toLowerCase().includes('empower') ||
        workerEmpowerment.toLowerCase().includes('strengthen') ||
        economicImpact.toLowerCase().includes('benefit') && economicImpact.toLowerCase().includes('worker')
    ) {
        impactCategory = 'worker_empowering';
    } else if (
        workerEmpowerment.toLowerCase().includes('harm') ||
        workerEmpowerment.toLowerCase().includes('weaken') ||
        classAnalysis.toLowerCase().includes('capital') && classAnalysis.toLowerCase().includes('benefit')
    ) {
        impactCategory = 'capital_empowering';
    }
    
    return {
        ...analysis,
        impact_category: impactCategory,
        materialist_analysis_applied: true
    };
}

module.exports = {
    ECONOMIC_FRAMEWORKS,
    generateMaterialistAnalysisPrompt,
    generateMaterialistChatPrompt,
    categorizeBillImpact
};

console.log('📚 Economic Analysis Framework loaded (Das Kapital principles)');
console.log('🛡️  Privacy: Framework stays on backend (zero-knowledge)');
console.log('⚖️  Analysis focuses on material class impact, not political labels');
