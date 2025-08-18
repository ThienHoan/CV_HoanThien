import pool from './db';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createContactsTable() {
    const client = await pool.connect();
    
    try {
        // Create contacts table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await client.query(createTableQuery);
        console.log('Contacts table created successfully');
        
        // Create index on email for better performance
        const createIndexQuery = `
            CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
        `;
        
        await client.query(createIndexQuery);
        console.log('Index on email created successfully');
        
    } catch (error) {
        console.error('Error creating contacts table:', error);
    } finally {
        client.release();
    }
}

// Run the migration
createContactsTable();
