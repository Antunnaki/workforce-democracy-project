/**
 * USER BACKUP MODEL
 * Version: 1.0.0-PERSONALIZATION
 * Date: January 15, 2025
 * 
 * Stores encrypted user data
 * Server cannot decrypt this data (zero-knowledge)
 * 
 * Storage per user: ~10 KB average
 * 100,000 users = ~1 GB total (very cheap!)
 */

const mongoose = require('mongoose');

const UserBackupSchema = new mongoose.Schema({
  // Username (unique identifier, not email)
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
    // Note: index created separately at line 75
  },

  // Encrypted user data (server cannot read this)
  encrypted_data: {
    type: String,
    required: true
  },

  // Initialization Vector (IV) for AES-GCM encryption
  iv: {
    type: String,
    required: true
  },

  // Salt for encryption (public, needed for decryption)
  encryption_salt: {
    type: String,
    required: true
  },

  // Recovery key hash (for password reset)
  recovery_hash: {
    type: String,
    required: true
  },

  // Metadata
  created_at: {
    type: Date,
    default: Date.now
  },

  last_sync: {
    type: Date,
    default: Date.now
  },

  last_login: {
    type: Date,
    default: Date.now
  },

  // Anonymous usage stats (not linked to specific users)
  device_count: {
    type: Number,
    default: 1
  }
});

// Index for faster queries
UserBackupSchema.index({ username: 1 });
UserBackupSchema.index({ last_sync: -1 });

// Estimate storage size
UserBackupSchema.methods.getStorageSize = function() {
  return Buffer.byteLength(this.encrypted_data, 'utf8');
};

// Static method to get total storage
UserBackupSchema.statics.getTotalStorage = async function() {
  const result = await this.aggregate([
    {
      $project: {
        size: { $strLenBytes: '$encrypted_data' }
      }
    },
    {
      $group: {
        _id: null,
        totalSize: { $sum: '$size' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { totalSize: 0, count: 0 };
};

module.exports = mongoose.model('UserBackup', UserBackupSchema);
