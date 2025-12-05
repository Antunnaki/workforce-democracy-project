/**
 * USERNAME VALIDATION UTILITY
 * Version: 1.0.0
 * Date: January 20, 2025
 * 
 * Ethical username validation to prevent:
 * - Profanity and obscenities
 * - Hate speech and slurs
 * - Bullying and harassment terms
 * - Culturally insensitive language
 * - Impersonation of officials/brands
 * 
 * This filter protects the integrity and inclusivity of the platform.
 */

/**
 * Comprehensive blocklist of inappropriate terms
 * Organized by category for maintainability
 */
const BLOCKLIST = {
  // Common profanity (basic set - can be expanded)
  profanity: [
    'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'ass', 'bastard',
    'piss', 'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'retard'
  ],
  
  // Hate speech and slurs (partial list - expand as needed)
  hateSlurs: [
    'nigger', 'nigga', 'chink', 'spic', 'wetback', 'kike', 'beaner',
    'gook', 'towelhead', 'raghead', 'cracker', 'honkey', 'whitey',
    'jap', 'paki', 'muzzie', 'terrorist', 'nazi', 'hitler'
  ],
  
  // Bullying and harassment terms
  bullying: [
    'loser', 'stupid', 'idiot', 'moron', 'dumb', 'ugly', 'fat',
    'kill', 'die', 'suicide', 'rape', 'molest', 'pedo', 'pedophile'
  ],
  
  // Sexually explicit terms
  sexual: [
    'porn', 'sex', 'nude', 'naked', 'boobs', 'tits', 'penis', 'vagina',
    'anal', 'oral', 'masturbate', 'orgasm', 'horny', 'fetish'
  ],
  
  // Impersonation risks (official titles/brands)
  impersonation: [
    'admin', 'moderator', 'staff', 'official', 'support', 'system',
    'president', 'senator', 'congress', 'fbi', 'cia', 'police',
    'google', 'facebook', 'twitter', 'microsoft', 'apple'
  ],
  
  // Culturally insensitive terms
  culturallyInsensitive: [
    'jihad', 'isis', 'taliban', 'slave', 'master', 'plantation',
    'genocide', 'holocaust', 'apartheid', 'segregation'
  ]
};

/**
 * Flatten all blocklist arrays into a single set for fast lookup
 */
const BLOCKED_TERMS = new Set(
  Object.values(BLOCKLIST).flat().map(term => term.toLowerCase())
);

/**
 * Patterns that are always rejected (regex-based)
 */
const BLOCKED_PATTERNS = [
  /(\w)\1{4,}/i,           // Excessive repetition (aaaaa, 11111)
  /^[0-9]+$/,              // All numbers
  /^test\d*$/i,            // Test accounts (test, test1, test123)
  /admin\d*/i,             // Admin variations
  /mod\d*/i,               // Moderator variations
  /^(xxx|sex|porn)/i,      // Explicit prefixes
  /\b(kill|die|death)\b/i  // Violence-related words
];

/**
 * Leet speak mappings for detection
 * (e.g., "4dm1n" -> "admin")
 */
const LEET_SPEAK_MAP = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i'
};

/**
 * Normalize username to catch obfuscation attempts
 * @param {string} username - Raw username
 * @returns {string} - Normalized username
 */
function normalizeUsername(username) {
  let normalized = username.toLowerCase();
  
  // Convert leet speak to normal letters
  for (const [leet, normal] of Object.entries(LEET_SPEAK_MAP)) {
    normalized = normalized.replace(new RegExp(leet, 'g'), normal);
  }
  
  // Remove special characters and numbers (for partial matching)
  const stripped = normalized.replace(/[^a-z]/g, '');
  
  return { normalized, stripped };
}

/**
 * Check if username contains blocked terms
 * @param {string} username - Username to check
 * @returns {Object} - { isValid: boolean, reason: string }
 */
function containsBlockedTerm(username) {
  const { normalized, stripped } = normalizeUsername(username);
  
  // Check exact matches in blocklist
  for (const term of BLOCKED_TERMS) {
    if (normalized.includes(term) || stripped.includes(term)) {
      return {
        isValid: false,
        reason: 'Username contains inappropriate language'
      };
    }
  }
  
  // Check regex patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(username)) {
      return {
        isValid: false,
        reason: 'Username format is not allowed'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Main validation function
 * @param {string} username - Username to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
function validateUsername(username) {
  // Basic checks
  if (!username || typeof username !== 'string') {
    return {
      valid: false,
      error: 'Username is required'
    };
  }
  
  const trimmed = username.trim();
  
  // Length validation
  if (trimmed.length < 3) {
    return {
      valid: false,
      error: 'Username must be at least 3 characters'
    };
  }
  
  if (trimmed.length > 50) {
    return {
      valid: false,
      error: 'Username must be 50 characters or less'
    };
  }
  
  // Character validation (alphanumeric, underscore, hyphen only)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens'
    };
  }
  
  // Must start with a letter
  if (!/^[a-zA-Z]/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username must start with a letter'
    };
  }
  
  // Check for inappropriate content
  const blockedCheck = containsBlockedTerm(trimmed);
  if (!blockedCheck.isValid) {
    return {
      valid: false,
      error: blockedCheck.reason
    };
  }
  
  // All validations passed
  return {
    valid: true,
    error: null
  };
}

/**
 * Check if username is appropriate (exported function)
 * @param {string} username - Username to validate
 * @returns {Object} - { valid: boolean, error: string|null, sanitized: string }
 */
function isUsernameAppropriate(username) {
  const result = validateUsername(username);
  
  return {
    valid: result.valid,
    error: result.error,
    sanitized: username ? username.trim() : null
  };
}

module.exports = {
  validateUsername,
  isUsernameAppropriate,
  BLOCKLIST // Export for testing/admin purposes
};
