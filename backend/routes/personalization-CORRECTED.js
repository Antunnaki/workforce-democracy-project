/**
 * PERSONALIZATION API ROUTES (CORRECTED)
 * Version: v37.11.4-PERSONALIZATION
 * Date: November 16, 2025
 * 
 * FIXED: Removed UserBackup model dependency (doesn't exist)
 * CHANGED: Using in-memory Map() storage as originally intended
 * 
 * Zero-knowledge encryption API
 * Server cannot read user data
 * 
 * Endpoints:
 * POST   /api/personalization/register   - Create account
 * POST   /api/personalization/login      - Get encrypted data
 * PUT    /api/personalization/sync       - Update encrypted data
 * DELETE /api/personalization/account    - Delete account
 * GET    /api/personalization/export     - Download all data
 * POST   /api/personalization/reset      - Password reset with recovery key
 * GET    /api/personalization/health     - Health check
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database later if needed)
// Structure: Map<username, { encrypted_data, encryption_salt, recovery_hash, created_at, last_sync, device_count }>
const users = new Map();

console.log('🔐 Personalization API Routes initialized');

// =============================================================================
// REGISTRATION
// =============================================================================

/**
 * Register new account
 * POST /api/personalization/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, encrypted_data, encryption_salt, recovery_hash } = req.body;

    // Validate input
    if (!username || !encrypted_data || !encryption_salt || !recovery_hash) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Check username length
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        success: false,
        error: 'Username must be between 3 and 50 characters' 
      });
    }

    // Check if username already exists
    if (users.has(username)) {
      return res.status(409).json({ 
        success: false,
        error: 'Username already taken' 
      });
    }

    // Create user account
    users.set(username, {
      username,
      encrypted_data,
      encryption_salt,
      recovery_hash,
      created_at: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      last_login: new Date().toISOString(),
      device_count: 1
    });

    console.log(`✅ New user registered: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      username
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create account' 
    });
  }
});

// =============================================================================
// LOGIN
// =============================================================================

/**
 * Login (retrieve encrypted data)
 * POST /api/personalization/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false,
        error: 'Username required' 
      });
    }

    // Find user
    const userBackup = users.get(username);
    
    if (!userBackup) {
      return res.status(404).json({ 
        success: false,
        error: 'Account not found' 
      });
    }

    // Increment device count and update last login
    userBackup.device_count = (userBackup.device_count || 1) + 1;
    userBackup.last_login = new Date().toISOString();
    users.set(username, userBackup);

    console.log(`✅ User logged in: ${username}`);

    res.json({
      success: true,
      encrypted_data: userBackup.encrypted_data,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve account data' 
    });
  }
});

// =============================================================================
// SYNC
// =============================================================================

/**
 * Sync (update encrypted data)
 * PUT /api/personalization/sync
 */
router.put('/sync', async (req, res) => {
  try {
    const { username, encrypted_data, last_sync } = req.body;

    if (!username || !encrypted_data) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Find user
    const userBackup = users.get(username);
    
    if (!userBackup) {
      return res.status(404).json({ 
        success: false,
        error: 'Account not found' 
      });
    }

    // Check if server has newer data
    const serverTime = new Date(userBackup.last_sync).getTime();
    const clientTime = new Date(last_sync).getTime();
    
    if (serverTime > clientTime) {
      // Server has newer data, send it back
      console.log(`⚠️  Server data newer for ${username}, sending server version`);
      return res.json({
        success: true,
        server_data_newer: true,
        encrypted_data: userBackup.encrypted_data,
        last_sync: userBackup.last_sync
      });
    }

    // Update with client's data
    userBackup.encrypted_data = encrypted_data;
    userBackup.last_sync = new Date().toISOString();
    users.set(username, userBackup);

    console.log(`✅ Data synced for user: ${username}`);

    res.json({
      success: true,
      server_data_newer: false,
      last_sync: userBackup.last_sync
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to sync data' 
    });
  }
});

// =============================================================================
// DELETE ACCOUNT
// =============================================================================

/**
 * Delete account
 * DELETE /api/personalization/account
 */
router.delete('/account', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false,
        error: 'Username required' 
      });
    }

    // Delete user
    const deleted = users.delete(username);

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Account not found' 
      });
    }

    console.log(`✅ Account deleted: ${username}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete account' 
    });
  }
});

// =============================================================================
// EXPORT DATA (GDPR COMPLIANCE)
// =============================================================================

/**
 * Export data (for GDPR compliance)
 * GET /api/personalization/export/:username
 */
router.get('/export/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find user
    const userBackup = users.get(username);
    
    if (!userBackup) {
      return res.status(404).json({ 
        success: false,
        error: 'Account not found' 
      });
    }

    console.log(`✅ Data exported for: ${username}`);

    // Return encrypted data (user can decrypt with their password)
    res.json({
      success: true,
      username: userBackup.username,
      encrypted_data: userBackup.encrypted_data,
      encryption_salt: userBackup.encryption_salt,
      created_at: userBackup.created_at,
      last_sync: userBackup.last_sync,
      note: 'This data is encrypted. Use your password to decrypt it.'
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export data' 
    });
  }
});

// =============================================================================
// PASSWORD RESET
// =============================================================================

/**
 * Password reset with recovery key
 * POST /api/personalization/reset
 */
router.post('/reset', async (req, res) => {
  try {
    const { username, recovery_key, new_password_hash, new_encrypted_data, new_salt } = req.body;

    if (!username || !recovery_key || !new_password_hash || !new_encrypted_data || !new_salt) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Find user
    const userBackup = users.get(username);
    
    if (!userBackup) {
      return res.status(404).json({ 
        success: false,
        error: 'Account not found' 
      });
    }

    // Verify recovery key
    // In production, hash the recovery key before comparing
    if (userBackup.recovery_hash !== recovery_key) {
      return res.status(401).json({
        success: false,
        error: 'Invalid recovery key'
      });
    }

    // Update password and data
    userBackup.encrypted_data = new_encrypted_data;
    userBackup.encryption_salt = new_salt;
    userBackup.last_sync = new Date().toISOString();
    users.set(username, userBackup);

    console.log(`✅ Password reset for: ${username}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reset password' 
    });
  }
});

// =============================================================================
// STATS (ANONYMOUS, FOR ADMIN)
// =============================================================================

/**
 * Get server stats (anonymous, for admin)
 * GET /api/personalization/stats
 */
router.get('/stats', async (req, res) => {
  try {
    let totalSize = 0;
    users.forEach(user => {
      totalSize += Buffer.byteLength(user.encrypted_data || '', 'utf8');
    });

    const totalUsers = users.size;
    const avgSize = totalUsers > 0 ? Math.round(totalSize / totalUsers) : 0;

    res.json({
      success: true,
      total_users: totalUsers,
      total_storage_bytes: totalSize,
      total_storage_mb: (totalSize / (1024 * 1024)).toFixed(2),
      average_user_size_bytes: avgSize,
      average_user_size_kb: (avgSize / 1024).toFixed(2)
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get stats' 
    });
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * GET /api/personalization/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        total_users: users.size,
        version: 'v37.11.4-PERSONALIZATION'
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Error handling middleware
 */
router.use((error, req, res, next) => {
    console.error('Unhandled error in personalization API:', error);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

module.exports = router;
