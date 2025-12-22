/**
 * COLLAPSIBLE SECTIONS - Bills Dropdown Functionality
 */

/**
 * Toggle collapsible section visibility
 * @param {string} contentId - ID of the content div to toggle
 */
function toggleCollapsible(contentId) {
    const content = document.getElementById(contentId);
    const header = content.previousElementSibling;
    
    if (!content || !header) return;
    
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
        // Collapse
        content.style.display = 'none';
        header.setAttribute('aria-expanded', 'false');
    } else {
        // Expand
        content.style.display = 'block';
        header.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Note: Bill type icons are defined in civic-voting.js getBillTypeIcon() function
 * Icons include: education 📚, health 🏥, housing 🏠, labor 💼, environment 🌍, 
 * economy 💰, civil-rights ⚖️, transportation 🚇, energy ⚡, agriculture 🌾,
 * technology 💻, defense 🛡️, immigration 🌐, veterans 🎖️, and more.
 */

console.log('✅ Collapsible sections and bill icons initialized');
