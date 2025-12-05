/**
 * WORKFORCE DEMOCRACY PROJECT - Contact Info Enhancer
 * Version: 37.17.0-CONTACT-ENHANCEMENT
 * Date: November 24, 2025
 * 
 * Purpose: Enhance representative contact information with:
 * - District office contact pages
 * - Contact form URLs
 * - Phone/email fallback strategies
 * - DuckDuckGo search integration for missing data
 * 
 * PHILOSOPHY: Make it EASY for citizens to contact their representatives
 * Even if Congress.gov doesn't provide emails, we'll find contact forms!
 */

/**
 * Enhance contact information for a representative
 * Adds contact page URLs, district office info, and search fallbacks
 * 
 * @param {object} rep - Representative object from us-representatives.js
 * @returns {object} - Enhanced representative with contactInfo object
 */
function enhanceContactInfo(rep) {
    const enhanced = { ...rep };
    
    // Create contact info enhancement object
    enhanced.contactInfo = {
        // Original data
        phone: rep.phone || null,
        email: rep.email || null,
        website: rep.website || null,
        
        // Enhanced URLs
        contactPageUrl: null,
        contactFormUrl: null,
        districtOfficeUrl: null,
        
        // Search fallbacks
        ddgSearchUrl: null,
        
        // Availability flags
        hasDirectPhone: !!rep.phone,
        hasDirectEmail: !!rep.email,
        hasWebsite: !!rep.website,
        
        // Enhanced metadata
        enhancedAt: Date.now(),
        enhancementVersion: '37.17.0'
    };
    
    // If we have a website, construct likely contact URLs
    if (rep.website) {
        const baseUrl = rep.website.replace(/\/$/, ''); // Remove trailing slash
        
        // Common contact page patterns for Congress websites
        enhanced.contactInfo.contactPageUrl = `${baseUrl}/contact`;
        enhanced.contactInfo.contactFormUrl = `${baseUrl}/contact/email-me`;
        
        // District office pages (common pattern)
        if (rep.level === 'federal') {
            enhanced.contactInfo.districtOfficeUrl = `${baseUrl}/offices`;
        }
    }
    
    // Create DuckDuckGo search URL for finding contact info
    if (rep.name && rep.website) {
        const searchQuery = `"${rep.name}" contact phone email site:${rep.website.replace('https://', '').replace('http://', '')}`;
        enhanced.contactInfo.ddgSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
    }
    
    return enhanced;
}

/**
 * Generate smart contact button data for frontend
 * Returns button configurations with fallback strategies
 * 
 * @param {object} contactInfo - Enhanced contact info object
 * @param {string} repName - Representative name (for display)
 * @returns {object} - Button configurations for frontend
 */
function getSmartContactButtons(contactInfo, repName) {
    return {
        phone: {
            available: contactInfo.hasDirectPhone,
            primary: contactInfo.phone ? `tel:${contactInfo.phone}` : null,
            fallback: contactInfo.contactPageUrl || contactInfo.ddgSearchUrl,
            fallbackText: contactInfo.phone ? null : 'Find Phone Number',
            icon: '📞',
            label: contactInfo.phone || 'Phone'
        },
        email: {
            available: contactInfo.hasDirectEmail,
            primary: contactInfo.email ? `mailto:${contactInfo.email}` : null,
            fallback: contactInfo.contactFormUrl || contactInfo.contactPageUrl,
            fallbackText: contactInfo.email ? null : 'Contact Form',
            icon: '✉️',
            label: contactInfo.email ? 'Email' : 'Contact Form'
        },
        website: {
            available: contactInfo.hasWebsite,
            primary: contactInfo.website,
            fallback: null, // Website is always available
            fallbackText: null,
            icon: '🌐',
            label: 'Website'
        },
        districtOffice: {
            available: !!contactInfo.districtOfficeUrl,
            primary: contactInfo.districtOfficeUrl,
            fallback: contactInfo.contactPageUrl,
            fallbackText: 'District Offices',
            icon: '🏢',
            label: 'Local Office'
        }
    };
}

/**
 * Construct contact URLs for specific representative types
 * Different URL patterns for Senate vs House
 * 
 * @param {object} rep - Representative object
 * @returns {object} - Specific contact URLs
 */
function getCongressContactUrls(rep) {
    if (!rep.website) return {};
    
    const baseUrl = rep.website.replace(/\/$/, '');
    const urls = {};
    
    // Senate-specific patterns
    if (rep.office === 'United States Senate') {
        urls.contact = `${baseUrl}/contact`;
        urls.contactForm = `${baseUrl}/contact/email-me`;
        urls.offices = `${baseUrl}/offices`;
        urls.services = `${baseUrl}/services`;
    }
    // House-specific patterns
    else if (rep.office === 'U.S. House of Representatives') {
        urls.contact = `${baseUrl}/contact`;
        urls.contactForm = `${baseUrl}/contact/email`;
        urls.offices = `${baseUrl}/offices`;
        urls.services = `${baseUrl}/services`;
    }
    // State legislators (OpenStates)
    else if (rep.level === 'state') {
        // State legislator websites vary widely
        urls.contact = `${baseUrl}/contact`;
        urls.contactForm = `${baseUrl}/contact`;
    }
    
    return urls;
}

/**
 * Create a comprehensive contact info object for frontend display
 * Includes all possible contact methods with smart fallbacks
 * 
 * @param {object} rep - Representative object
 * @returns {object} - Complete contact information bundle
 */
function createContactBundle(rep) {
    const enhanced = enhanceContactInfo(rep);
    const buttons = getSmartContactButtons(enhanced.contactInfo, rep.name);
    const specificUrls = getCongressContactUrls(rep);
    
    return {
        representative: {
            id: rep.id,
            name: rep.name,
            title: rep.title,
            office: rep.office,
            level: rep.level
        },
        
        // Direct contact methods
        direct: {
            phone: enhanced.contactInfo.phone,
            email: enhanced.contactInfo.email,
            website: enhanced.contactInfo.website
        },
        
        // Enhanced URLs
        urls: {
            ...specificUrls,
            contactPage: enhanced.contactInfo.contactPageUrl,
            contactForm: enhanced.contactInfo.contactFormUrl,
            districtOffice: enhanced.contactInfo.districtOfficeUrl,
            ddgSearch: enhanced.contactInfo.ddgSearchUrl
        },
        
        // Smart button configurations for frontend
        buttons: buttons,
        
        // Metadata
        meta: {
            hasDirectPhone: enhanced.contactInfo.hasDirectPhone,
            hasDirectEmail: enhanced.contactInfo.hasDirectEmail,
            hasWebsite: enhanced.contactInfo.hasWebsite,
            enhancedAt: enhanced.contactInfo.enhancedAt,
            version: enhanced.contactInfo.enhancementVersion
        }
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    enhanceContactInfo,
    getSmartContactButtons,
    getCongressContactUrls,
    createContactBundle
};
