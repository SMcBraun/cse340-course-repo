/*
====================================================================
FILE: src/models/db.js
PURPOSE:
This file creates and manages our live connection to PostgreSQL.
Instead of opening a new slow connection every time a user loads 
a webpage, we use a "connection pool" (a group of ready-to-use 
connections waiting to handle database requests).
====================================================================
*/

import { Pool } from 'pg';

// Set up the reusable connection pool using our private DB_URL from the .env file
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

let db = null;

// While we are testing and building on our computer, log every SQL query to the terminal
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: res.rowCount
                });
                return res;
            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });
                throw error;
            }
        },

        async close() {
            await pool.end();
        }
    };
} else {
    // When live on the internet, run queries directly without terminal chatter
    db = pool;
}

// A quick health check to make sure the database answers before we launch
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { db as default, testConnection };