import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// Test connection
pool.on('connect', () => {
    console.log('Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

export default pool;
