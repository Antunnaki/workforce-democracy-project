/**
 * POSTGRESQL DATABASE CLIENT
 * Version: V37.17.0-BILL-CACHE
 * Date: 2025-01-XX
 * 
 * PostgreSQL connection pool for bill analysis caching
 * 
 * Features:
 * - Connection pooling for performance
 * - Automatic reconnection on failure
 * - Transaction support
 * - Query helpers
 */

const { Pool } = require('pg');

// =====================================================================
// DATABASE CONFIGURATION
// =====================================================================

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'workforce_democracy',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    
    // Connection pool settings
    max: 20,                    // Maximum number of connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000,  // Wait 10 seconds for connection
});

// =====================================================================
// EVENT HANDLERS
// =====================================================================

pool.on('connect', () => {
    console.log('✅ [PostgreSQL] Connected to database');
});

pool.on('error', (err) => {
    console.error('❌ [PostgreSQL] Unexpected error on idle client:', err);
    process.exit(-1);
});

// =====================================================================
// QUERY HELPERS
// =====================================================================

/**
 * Execute a SQL query
 * 
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} - Query result
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (duration > 100) {
            console.warn(`⚠️  [PostgreSQL] Slow query (${duration}ms): ${text.substring(0, 100)}...`);
        }
        
        return res;
    } catch (error) {
        console.error('❌ [PostgreSQL] Query error:', error.message);
        console.error('   Query:', text);
        console.error('   Params:', params);
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 * 
 * @returns {Promise<object>} - PostgreSQL client
 */
async function getClient() {
    try {
        const client = await pool.connect();
        return client;
    } catch (error) {
        console.error('❌ [PostgreSQL] Failed to get client:', error.message);
        throw error;
    }
}

/**
 * Execute a transaction
 * 
 * @param {Function} callback - Async function that receives client
 * @returns {Promise<any>} - Result of callback
 */
async function transaction(callback) {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// =====================================================================
// HEALTH CHECK
// =====================================================================

/**
 * Check database connection
 * 
 * @returns {Promise<boolean>} - True if connected
 */
async function checkConnection() {
    try {
        const result = await query('SELECT NOW() as current_time');
        console.log('✅ [PostgreSQL] Health check passed:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('❌ [PostgreSQL] Health check failed:', error.message);
        return false;
    }
}

// =====================================================================
// GRACEFUL SHUTDOWN
// =====================================================================

/**
 * Close all database connections
 */
async function close() {
    try {
        await pool.end();
        console.log('✅ [PostgreSQL] Connection pool closed');
    } catch (error) {
        console.error('❌ [PostgreSQL] Error closing pool:', error.message);
    }
}

// Handle shutdown signals
process.on('SIGINT', async () => {
    await close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await close();
    process.exit(0);
});

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = {
    query,
    getClient,
    transaction,
    checkConnection,
    close,
    pool  // Export pool for advanced usage
};
