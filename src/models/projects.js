/*
====================================================================
FILE: src/models/projects.js
PURPOSE:
Data model for Service Projects. Handles SQL interactions with the 
'project' table and relational JOINs with the 'organization' table.
====================================================================
*/

// PLAIN ENGLISH: Connect to our PostgreSQL database so we can run queries.
// LOGIC: Imports the db connection pool helper from ./db.js.
// WHY WE NEED IT: Allows model functions to run parameterized SQL against PostgreSQL tables.
// LEARNING GAP: Centralized connection pooling handles database resources efficiently without leaking connections.
import db from './db.js';

// ============================================================================
// ALL PROJECTS QUERY
// ============================================================================

// PLAIN ENGLISH: Retrieve all projects from the database.
// LOGIC: Queries the project table and orders the records by project_date.
// WHY WE NEED IT: Retains baseline capability to view the entire catalog of projects.
// LEARNING GAP: Keeps legacy model logic available for reporting or admin listing needs.
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
// PROJECTS BY ORGANIZATION QUERY
// ============================================================================

// PLAIN ENGLISH: Retrieve only the service projects that belong to a specific organization.
// LOGIC: Filters project records matching the foreign key organization_id parameter.
// WHY WE NEED IT: Powers the organization details page so visitors see projects affiliated with that group.
// LEARNING GAP: Parameterized placeholders ($1) prevent SQL injection vulnerabilities from dynamic route inputs.
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
// UPCOMING PROJECTS QUERY (WITH TABLE JOIN)
// ============================================================================

// PLAIN ENGLISH: Find the next few upcoming service projects whose dates have not yet passed, plus the name of the group running each project.
// LOGIC: Executes an INNER JOIN between 'project' and 'organization' on organization_id, filtering for project_date >= CURRENT_DATE, sorted ascending, and limited by $1.
// WHY WE NEED IT: Powers the main projects page so users see immediate upcoming volunteer opportunities rather than past dates.
// LEARNING GAP: An INNER JOIN connects two relational tables using a foreign key relationship to fetch data across both entities in a single database round-trip.
const getUpcomingProjects = async (number_of_projects) => {
  const query = `
      SELECT
        p.project_id,
        p.title,
        p.description,
        p.project_date,
        p.location,
        p.organization_id,
        o.name AS organization_name
      FROM project p
      INNER JOIN organization o ON p.organization_id = o.organization_id
      WHERE p.project_date >= CURRENT_DATE
      ORDER BY p.project_date ASC
      LIMIT $1;
    `;
  const queryParams = [number_of_projects];
  const result = await db.query(query, queryParams);
  return result.rows;
};

// ============================================================================
// SINGLE PROJECT DETAILS QUERY (WITH TABLE JOIN)
// ============================================================================

// PLAIN ENGLISH: Fetch the full details of a single service project, along with its host organization's name.
// LOGIC: Queries 'project' joined with 'organization' matching p.project_id with parameter $1.
// WHY WE NEED IT: Powers the service project details view (/project/:id).
// LEARNING GAP: Returning a single row object (or null) prevents views from having to handle array indexing.
const getProjectDetails = async (id) => {
  const query = `
      SELECT
        p.project_id,
        p.title,
        p.description,
        p.project_date,
        p.location,
        p.organization_id,
        o.name AS organization_name
      FROM project p
      INNER JOIN organization o ON p.organization_id = o.organization_id
      WHERE p.project_id = $1;
    `;
  const queryParams = [id];
  const result = await db.query(query, queryParams);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export model query functions for use across the controller layer.
// LOGIC: Exports query functions via named ES Module syntax.
export {
  getAllProjects,
  getProjectsByOrganizationId,
  getUpcomingProjects,
  getProjectDetails
};