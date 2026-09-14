/*
====================================================================
FILE: src/models/projects.js
PURPOSE:
This file acts as our data model for Projects. It handles all direct 
communication with the PostgreSQL database table for service projects.
====================================================================
*/

// PLAIN ENGLISH: Import our custom database connection pool so we can query PostgreSQL.
// LOGIC: Imports the db query client from ./db.js.
// WHY WE NEED IT: Allows us to execute raw SQL statements against our database tables.
// LEARNING GAP: Centralizes connection pooling in db.js rather than making individual connections.
import db from './db.js';

// ============================================================================
// ALL PROJECTS MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Fetch every single service project in the database.
// LOGIC: An asynchronous query function executing a SELECT SQL statement on the 'project' table.
// WHY WE NEED IT: Supplies the data for the /projects route so visitors can browse all opportunities.
// LEARNING GAP: Models focus purely on executing data access logic and returning plain rows to controllers.
const getAllProjects = async () => {
    const query = `
      SELECT
        project_id,
        organization_id,
        title,
        description,
        location,
        project_date
      FROM project
      ORDER BY project_date;
    `;
    const result = await db.query(query);
    return result.rows;
};

// ============================================================================
// PROJECTS BY ORGANIZATION MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Retrieve only the service projects that belong to a specific organization.
// LOGIC: Queries the 'project' table filtering by foreign key organization_id with parameterized SQL.
// WHY WE NEED IT: Powers the organization details page so users see the projects affiliated with that group.
// LEARNING GAP: Using parameterized queries ($1) ensures user inputs are never executed as malicious SQL injection.
const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
      SELECT
        project_id,
        organization_id,
        title,
        description,
        location,
        project_date
      FROM project
      WHERE organization_id = $1
      ORDER BY project_date;
    `;

    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);

    return result.rows;
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export both project queries so controllers can call them.
// LOGIC: Exports both functions using ES Module named export syntax.
// WHY WE NEED IT: Makes both functions available to src/controllers/projects.js and src/controllers/organizations.js.
// LEARNING GAP: Named exports allow multiple query helpers to be cleanly shared across different controllers.
export { getAllProjects, getProjectsByOrganizationId };