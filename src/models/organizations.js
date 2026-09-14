/*
====================================================================
FILE: src/models/organizations.js
PURPOSE:
This file acts as our data model for Organizations. It handles all
direct communication with the PostgreSQL database table for organizations.
====================================================================
*/

// PLAIN ENGLISH: Import our custom database connection pool so we can execute queries against PostgreSQL.
// LOGIC: Imports the db object holding our pg Pool query method from ./db.js.
// WHY WE NEED IT: Node.js cannot talk to PostgreSQL on its own; it requires this pooled connection client to send SQL statements.
// LEARNING GAP: Centralizing database execution logic in db.js prevents opening dozens of unmanaged connections across multiple model files.
import db from './db.js';

// ============================================================================
// ALL ORGANIZATIONS MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Go to the database and retrieve every organization record available.
// LOGIC: An asynchronous query function executing a SELECT SQL query against the 'organization' table, sorted by name.
// WHY WE NEED IT: Supplies data to our /organizations route so visitors can see the full list of partner charities.
// LEARNING GAP: Models handle data fetching and SQL construction exclusively; they never interact with HTTP request or response objects.
const getAllOrganizations = async () => {
    const query = `
      SELECT
        organization_id,
        name,
        description,
        contact_email,
        logo_filename
      FROM organization
      ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

// ============================================================================
// SINGLE ORGANIZATION DETAILS MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Go to the database and find the details for one specific organization using its ID.
// LOGIC: An asynchronous query function taking organizationId as an argument and querying the database with parameterized SQL.
// WHY WE NEED IT: Powers the organization details page so users can learn more about a single partner group.
// LEARNING GAP: Parameterized queries ($1) prevent SQL Injection attacks by ensuring user inputs are treated strictly as data, never executable SQL commands.
const getOrganizationDetails = async (organizationId) => {
    const query = `
      SELECT
        organization_id,
        name,
        description,
        contact_email,
        logo_filename
      FROM organization
      WHERE organization_id = $1;
    `;

    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);

    // Return the first row found, or null if no match exists
    return result.rows.length > 0 ? result.rows[0] : null;
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export both database query tools so controllers can use them.
// LOGIC: Uses ES Module named export syntax to make getAllOrganizations and getOrganizationDetails accessible.
// WHY WE NEED IT: Allows our controllers (src/controllers/organizations.js) to import and call these functions.
// LEARNING GAP: Named exports allow us to bundle multiple focused query functions in a single model file.
export { getAllOrganizations, getOrganizationDetails };