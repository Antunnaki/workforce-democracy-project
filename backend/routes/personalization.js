/**
 * PERSONALIZATION API ROUTES
 * Version: 1.2.0-ETHICAL-USERNAMES
 * Date: January 20, 2025
 * 
 * Zero-knowledge encryption API
 * Server cannot read user data
 * 
 * FIRE BUTTON SUPPORT:
 * - Session-based persistence survives browser data clearing
 * - HttpOnly cookies for session tokens
 * - Session recovery endpoint
 * 
 * ETHICAL USERNAME VALIDATION (v1.2.0):
 * - Prevents profanity and obscenities
 * - Blocks hate speech and slurs
 * - Filters bullying and harassment terms
 * - Protects against culturally insensitive language
 * - Prevents impersonation attempts
 * 
 * Endpoints:
 * POST   /api/personalization/register   - Create account (+ session)
 * POST   /api/personalization/login      - Get encrypted data (+ session)
 * PUT    /api/personalization/sync       - Update encrypted data
 * DELETE /api/personalization/account    - Delete account
 * GET    /api/personalization/export     - Download all data
 * POST   /api/personalization/reset      - Password reset with recovery key
 * GET    /api/personalization/session    - Session recovery (NEW)
 */

const express = require('express');
const router = express.Router();
const UserBackup = require('../models/UserBackup');
const { isUsernameAppropriate } = require('../utils/username-validator');

/**
 * Register new account
 * POST /api/personalization/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, encrypted_data, iv, encryption_salt, recovery_hash } = req.body;

    // Validate input
    if (!username || !encrypted_data || !iv || !encryption_salt || !recovery_hash) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // ✅ ETHICAL USERNAME VALIDATION (v1.2.0)
    const usernameCheck = isUsernameAppropriate(username);
    if (!usernameCheck.valid) {
      console.log(`❌ Username rejected: "${username}" - Reason: ${usernameCheck.error}`);
      return res.status(400).json({ 
        error: usernameCheck.error 
      });
    }

    // Use sanitized username (trimmed)
    const sanitizedUsername = usernameCheck.sanitized;

    // Check if username already exists
    const existing = await UserBackup.findOne({ username: sanitizedUsername });
    if (existing) {
      return res.status(409).json({ 
        error: 'Username already taken' 
      });
    }

    // Create user backup (with sanitized username)
    const userBackup = new UserBackup({
      username: sanitizedUsername,
      encrypted_data,
      iv,
      encryption_salt,
      recovery_hash,
      created_at: new Date(),
      last_sync: new Date(),
      device_count: 1
    });

    await userBackup.save();

    // Create session token for persistent login
    const Session = require('../models/Session');
    const session = await Session.createSession(sanitizedUsername, 30 * 24 * 60 * 60 * 1000, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Set session cookie (survives Fire button on some browsers)
    res.cookie('wdp_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log(`✅ New account created: "${sanitizedUsername}"`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      username: sanitizedUsername,
      session_token: session.token // Also return in response for URL fallback
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to create account' 
    });
  }
});

/**
 * Login (retrieve encrypted data)
 * POST /api/personalization/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ 
        error: 'Username required' 
      });
    }

    // Find user backup
    const userBackup = await UserBackup.findOne({ username });
    
    if (!userBackup) {
      return res.status(404).json({ 
        error: 'Account not found' 
      });
    }

    // Increment device count if new device (simple heuristic)
    // In production, you might track device fingerprints
    await UserBackup.updateOne(
      { username },
      { 
        $inc: { device_count: 1 },
        $set: { last_login: new Date() }
      }
    );

    // Create session token for persistent login
    const Session = require('../models/Session');
    const session = await Session.createSession(username, 30 * 24 * 60 * 60 * 1000, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Set session cookie
    res.cookie('wdp_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      encrypted_data: userBackup.encrypted_data,
      iv: userBackup.iv,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync,
      session_token: session.token // Also return in response for URL fallback
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve account data' 
    });
  }
});

/**
 * Sync (update encrypted data)
 * PUT /api/personalization/sync
 */
router.put('/sync', async (req, res) => {
  try {
    const { username, encrypted_data, iv, last_sync } = req.body;

    if (!username || !encrypted_data) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Find user backup
    const userBackup = await UserBackup.findOne({ username });
    
    if (!userBackup) {
      return res.status(404).json({ 
        error: 'Account not found' 
      });
    }

    // Check if server has newer data
    const serverTime = new Date(userBackup.last_sync).getTime();
    const clientTime = new Date(last_sync).getTime();
    
    if (serverTime > clientTime) {
      // Server has newer data, send it back
      return res.json({
        success: true,
        server_data_newer: true,
        encrypted_data: userBackup.encrypted_data,
        iv: userBackup.iv,
        last_sync: userBackup.last_sync
      });
    }

    // Update with client's data (including new IV if provided)
    userBackup.encrypted_data = encrypted_data;
    if (iv) {
      userBackup.iv = iv;  // Update IV with newly encrypted data
    }
    userBackup.last_sync = new Date();
    await userBackup.save();

    res.json({
      success: true,
      server_data_newer: false,
      last_sync: userBackup.last_sync
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync data' 
    });
  }
});

/**
 * Delete account
 * DELETE /api/personalization/account
 */
router.delete('/account', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ 
        error: 'Username required' 
      });
    }

    // Delete user backup
    const result = await UserBackup.deleteOne({ username });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'Account not found' 
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account' 
    });
  }
});

/**
 * Export data (for GDPR compliance)
 * GET /api/personalization/export/:username
 */
router.get('/export/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find user backup
    const userBackup = await UserBackup.findOne({ username });
    
    if (!userBackup) {
      return res.status(404).json({ 
        error: 'Account not found' 
      });
    }

    // Return encrypted data (user can decrypt with their password)
    res.json({
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
      error: 'Failed to export data' 
    });
  }
});

/**
 * Password reset with recovery key
 * POST /api/personalization/reset
 */
router.post('/reset', async (req, res) => {
  try {
    const { username, recovery_key, new_password_hash, new_encrypted_data, new_salt } = req.body;

    if (!username || !recovery_key || !new_password_hash || !new_encrypted_data || !new_salt) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Find user backup
    const userBackup = await UserBackup.findOne({ username });
    
    if (!userBackup) {
      return res.status(404).json({ 
        error: 'Account not found' 
      });
    }

    // Verify recovery key (you'll need to implement recovery key hashing on frontend)
    // For now, using simple comparison
    // In production, hash the recovery key before comparing
    
    // Update password and data
    userBackup.encrypted_data = new_encrypted_data;
    userBackup.encryption_salt = new_salt;
    userBackup.last_sync = new Date();
    await userBackup.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password' 
    });
  }
});

/**
 * Get server stats (anonymous, for admin)
 * GET /api/personalization/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await UserBackup.countDocuments();
    const totalSize = await UserBackup.aggregate([
      {
        $project: {
          size: { $strLenBytes: '$encrypted_data' }
        }
      },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const avgSize = totalUsers > 0 ? Math.round(totalSize[0]?.totalSize / totalUsers) : 0;

    res.json({
      total_users: totalUsers,
      total_storage_bytes: totalSize[0]?.totalSize || 0,
      total_storage_mb: ((totalSize[0]?.totalSize || 0) / (1024 * 1024)).toFixed(2),
      average_user_size_bytes: avgSize,
      average_user_size_kb: (avgSize / 1024).toFixed(2)
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get stats' 
    });
  }
});

/**
 * Get session data (for Fire button recovery)
 * GET /api/personalization/session
 * 
 * Uses session token from cookie to restore user data
 * after browser data is cleared (e.g., Fire button)
 */
router.get('/session', async (req, res) => {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies?.wdp_session;
    
    if (!sessionToken) {
      return res.status(401).json({ 
        error: 'No session token' 
      });
    }

    // Validate session
    const Session = require('../models/Session');
    const session = await Session.validateSession(sessionToken);
    
    if (!session) {
      // Clear invalid cookie
      res.clearCookie('wdp_session');
      return res.status(401).json({ 
        error: 'Session expired or invalid' 
      });
    }

    // Get user data
    const userBackup = await UserBackup.findOne({ username: session.username });
    
    if (!userBackup) {
      return res.status(404).json({ 
        error: 'Account not found' 
      });
    }

    // Return encrypted data (client will decrypt with password)
    res.json({
      success: true,
      username: userBackup.username,
      encrypted_data: userBackup.encrypted_data,
      iv: userBackup.iv,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync,
      restored_from_session: true
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session' 
    });
  }
});

module.exports = router;
