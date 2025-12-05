/**
 * DIAGNOSTIC SCRIPT FOR PERSONALIZATION ISSUES
 * V37.12.3
 * 
 * Paste this entire script into browser console to diagnose why
 * personalization isn't flowing to Bills section
 */

console.log('🔍 ========================================');
console.log('🔍 PERSONALIZATION DIAGNOSTIC REPORT V37.12.3');
console.log('🔍 ========================================\n');

// 1. CHECK PERSONALIZATION SYSTEM
console.log('1️⃣ PERSONALIZATION SYSTEM CHECK:');
console.log('   window.PersonalizationSystem exists:', !!window.PersonalizationSystem);

if (window.PersonalizationSystem) {
    console.log('   ✅ PersonalizationSystem is available');
    console.log('   Methods available:', Object.keys(window.PersonalizationSystem).join(', '));
} else {
    console.error('   ❌ PersonalizationSystem NOT FOUND!');
    console.error('   This means personalization-system.js did not load or export correctly');
}

console.log('\n2️⃣ LOCALSTORAGE CHECK:');
console.log('   wdp_username:', localStorage.getItem('wdp_username'));
console.log('   wdp_password_hash:', localStorage.getItem('wdp_password_hash') ? 'EXISTS' : 'MISSING');
console.log('   wdp_salt:', localStorage.getItem('wdp_salt') ? 'EXISTS' : 'MISSING');
console.log('   wdp_user_data:', localStorage.getItem('wdp_user_data') ? 'EXISTS' : 'MISSING');
console.log('   wdp_personalization_enabled:', localStorage.getItem('wdp_personalization_enabled'));

console.log('\n3️⃣ USER DATA CHECK:');
if (window.PersonalizationSystem) {
    try {
        const userData = window.PersonalizationSystem.getUserData();
        console.log('   User data retrieved:', userData);
        console.log('   address.zip:', userData?.address?.zip || 'NOT SET');
        console.log('   representatives.zip:', userData?.representatives?.zip || 'NOT SET');
    } catch (e) {
        console.error('   ❌ Error getting user data:', e);
    }
} else {
    console.log('   ⚠️ Cannot check user data (PersonalizationSystem not available)');
}

console.log('\n4️⃣ BILLS SECTION STATE:');
if (typeof billsState !== 'undefined') {
    console.log('   billsState.personalized:', billsState.personalized);
    console.log('   billsState.userZipCode:', billsState.userZipCode);
} else {
    console.log('   ⚠️ billsState not defined (bills-section.js may not have loaded)');
}

console.log('\n5️⃣ DOM ELEMENTS CHECK:');
const gettingStarted = document.getElementById('billsGettingStarted');
const categoryTabs = document.getElementById('billsCategoryTabs');
console.log('   #billsGettingStarted display:', gettingStarted?.style.display || 'element not found');
console.log('   #billsCategoryTabs display:', categoryTabs?.style.display || 'element not found');

console.log('\n6️⃣ RECOMMENDED ACTIONS:');

const username = localStorage.getItem('wdp_username');
const hasZip = window.PersonalizationSystem?.getUserData()?.address?.zip;

if (!window.PersonalizationSystem) {
    console.error('   ❌ ACTION: PersonalizationSystem not loaded properly');
    console.error('   → Check browser console for JavaScript errors');
    console.error('   → Verify personalization-system.js is loading');
    console.error('   → Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
} else if (!username) {
    console.warn('   ⚠️ ACTION: User not logged in');
    console.warn('   → Create an account or log in');
    console.warn('   → Then refresh this diagnostic');
} else if (!hasZip) {
    console.warn('   ⚠️ ACTION: User logged in but no ZIP code saved');
    console.warn('   → Go to Civic Engagement → My Representatives');
    console.warn('   → Enter your ZIP code');
    console.warn('   → Then go back to Bills tab');
} else {
    console.log('   ✅ Everything looks good!');
    console.log('   → User logged in:', username);
    console.log('   → ZIP code saved:', hasZip);
    console.log('   → If Bills still shows "Get Started", check billsState above');
}

console.log('\n7️⃣ QUICK FIXES TO TRY:');
console.log('   A) Force re-initialize Bills section:');
console.log('      initializeBillsSection();');
console.log('');
console.log('   B) Manually set personalization flag:');
console.log('      billsState.personalized = true;');
console.log('      billsState.userZipCode = "' + (hasZip || '10001') + '";');
console.log('      updateBillsUI();');
console.log('');
console.log('   C) Hard refresh page:');
console.log('      location.reload(true);');

console.log('\n🔍 ========================================');
console.log('🔍 END OF DIAGNOSTIC REPORT');
console.log('🔍 ========================================\n');
