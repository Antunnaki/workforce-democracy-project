/**
 * EMERGENCY DIAGNOSTIC SCRIPT
 * 
 * This script will tell us EXACTLY what's clearing localStorage
 * Run this in the console BEFORE registering
 */

(function() {
  'use strict';
  
  console.log('🔍 EMERGENCY DIAGNOSTIC ACTIVE');
  console.log('📊 Monitoring ALL localStorage operations...');
  
  // Store originals
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  
  // Track all operations
  const operations = [];
  
  // Override setItem
  localStorage.setItem = function(key, value) {
    const operation = {
      type: 'SET',
      key: key,
      value: String(value).substring(0, 100),
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    };
    operations.push(operation);
    
    if (key.startsWith('wdp_')) {
      console.log('📝 SET wdp key:', key);
      console.trace();
    }
    
    return originalSetItem.apply(this, arguments);
  };
  
  // Override getItem
  localStorage.getItem = function(key) {
    const value = originalGetItem.apply(this, arguments);
    
    if (key.startsWith('wdp_')) {
      const operation = {
        type: 'GET',
        key: key,
        value: value ? 'EXISTS' : 'NULL',
        timestamp: new Date().toISOString()
      };
      operations.push(operation);
    }
    
    return value;
  };
  
  // Override removeItem
  localStorage.removeItem = function(key) {
    const operation = {
      type: 'REMOVE',
      key: key,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    };
    operations.push(operation);
    
    console.error('🔴 REMOVE CALLED:', key);
    console.trace();
    
    if (key.startsWith('wdp_')) {
      console.error('🚨 CRITICAL: Removing wdp key:', key);
      console.log('Stack trace:', new Error().stack);
    }
    
    return originalRemoveItem.apply(this, arguments);
  };
  
  // Override clear
  localStorage.clear = function() {
    const operation = {
      type: 'CLEAR',
      timestamp: new Date().toISOString(),
      keysBeforeClear: Object.keys(localStorage),
      stack: new Error().stack
    };
    operations.push(operation);
    
    console.error('🔴🔴🔴 localStorage.clear() CALLED! 🔴🔴🔴');
    console.trace();
    console.log('Keys that will be cleared:', Object.keys(localStorage));
    
    return originalClear.apply(this, arguments);
  };
  
  // Add global function to check operations
  window.getLocalStorageOperations = function() {
    return operations;
  };
  
  window.showWdpOperations = function() {
    const wdpOps = operations.filter(op => 
      op.key && op.key.startsWith('wdp_')
    );
    console.table(wdpOps);
    return wdpOps;
  };
  
  window.showRemoveOperations = function() {
    const removeOps = operations.filter(op => 
      op.type === 'REMOVE' || op.type === 'CLEAR'
    );
    console.table(removeOps);
    return removeOps;
  };
  
  // Monitor page unload
  window.addEventListener('beforeunload', () => {
    console.log('📊 FINAL REPORT BEFORE PAGE UNLOAD:');
    console.log('Total operations:', operations.length);
    console.log('Remove operations:', operations.filter(op => op.type === 'REMOVE').length);
    console.log('Clear operations:', operations.filter(op => op.type === 'CLEAR').length);
    
    const wdpKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wdp_')) {
        wdpKeys.push(key);
      }
    }
    console.log('wdp_ keys still in storage:', wdpKeys);
  });
  
  console.log('✅ Diagnostic script active!');
  console.log('📊 Available functions:');
  console.log('  - getLocalStorageOperations() - Get all operations');
  console.log('  - showWdpOperations() - Show wdp_ operations');
  console.log('  - showRemoveOperations() - Show remove/clear operations');
  
})();
