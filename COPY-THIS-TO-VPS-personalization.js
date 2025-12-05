/**
 * PERSONALIZATION API ROUTES
 * Version: 1.0.0-PERSONALIZATION
 * Date: January 15, 2025
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
 */

const express = require('express');
const router = express.Router();
const UserBackup = require('../models/UserBackup');

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

    // Check username length
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        error: 'Username must be between 3 and 50 characters' 
      });
    }

    // Check if username already exists
    const existing = await UserBackup.findOne({ username });
    if (existing) {
      return res.status(409).json({ 
        error: 'Username already taken' 
      });
    }

    // Create user backup
    const userBackup = new UserBackup({
      username,
      encrypted_data,
      iv,
      encryption_salt,
      recovery_hash,
      created_at: new Date(),
      last_sync: new Date(),
      device_count: 1
    });

    await userBackup.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      username
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

    res.json({
      success: true,
      encrypted_data: userBackup.encrypted_data,
      iv: userBackup.iv,
      encryption_salt: userBackup.encryption_salt,
      last_sync: userBackup.last_sync
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
    const { username, encrypted_data, last_sync } = req.body;

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
        last_sync: userBackup.last_sync
      });
    }

    // Update with client's data
    userBackup.encrypted_data = encrypted_data;
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
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account' 
    });
  }
});

module.exports = router;
