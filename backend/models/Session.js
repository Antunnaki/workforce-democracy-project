const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Session Model for Fire Button Persistence
 * 
 * Purpose: Store session tokens in MongoDB to survive DuckDuckGo Fire button usage
 * Fire button clears localStorage but HttpOnly cookies may persist in some browsers
 * 
 * WDP v37.11.5-FIRE-BUTTON
 */

const SessionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true,
    index: true
  },
  last_accessed: {
    type: Date,
    default: Date.now
  },
  user_agent: {
    type: String
  },
  ip_address: {
    type: String
  }
});

// Auto-delete expired sessions
SessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

/**
 * Create new session with random token
 * @param {string} username - User's username
 * @param {number} duration - Session duration in milliseconds (default: 30 days)
 * @param {object} metadata - Optional metadata (userAgent, ipAddress)
 * @returns {Promise<Session>} Created session document
 */
SessionSchema.statics.createSession = async function(username, duration = 30 * 24 * 60 * 60 * 1000, metadata = {}) {
  const token = crypto.randomBytes(32).toString('hex');
  
  const session = new this({
    username,
    token,
    expires_at: new Date(Date.now() + duration),
    user_agent: metadata.userAgent,
    ip_address: metadata.ipAddress
  });
  
  await session.save();
  return session;
};

/**
 * Validate session token and update last_accessed
 * @param {string} token - Session token to validate
 * @returns {Promise<Session|null>} Valid session or null
 */
SessionSchema.statics.validateSession = async function(token) {
  const session = await this.findOne({
    token,
    expires_at: { $gt: new Date() }
  });
  
  if (session) {
    session.last_accessed = new Date();
    await session.save();
  }
  
  return session;
};

/**
 * Delete all sessions for a user
 * @param {string} username - User's username
 * @returns {Promise<number>} Number of deleted sessions
 */
SessionSchema.statics.deleteUserSessions = async function(username) {
  const result = await this.deleteMany({ username });
  return result.deletedCount;
};

/**
 * Clean up expired sessions (manual cleanup if TTL index doesn't work)
 * @returns {Promise<number>} Number of deleted sessions
 */
SessionSchema.statics.cleanupExpiredSessions = async function() {
  const result = await this.deleteMany({
    expires_at: { $lt: new Date() }
  });
  return result.deletedCount;
};

module.exports = mongoose.model('Session', SessionSchema);
