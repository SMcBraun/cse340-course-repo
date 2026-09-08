/*
====================================================================
FILE: src/models/organizations.js
PURPOSE:
This file acts as our data model for Organizations. It handles all
direct communication with the PostgreSQL database table for organizations.
====================================================================
*/

// Import our custom database connection pool so we can execute queries against PostgreSQL
import db from './db.js';

// Define an asynchronous function because talking to a remote database takes time over the network
const getAllOrganizations = async () => {

    // Store the SQL query in a template literal string
    // We explicitly name each column instead of using SELECT * to improve speed and prevent leaking sensitive data
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization;
    `;

    // Send the query string to the database and pause (await) until PostgreSQL replies with the data
    const result = await db.query(query);

    // PostgreSQL wraps its response in a larger object; we return only the "rows" array containing our data records
    return result.rows;
};

// Export this specific function so route handlers in server.js can import and use it
export { getAllOrganizations };