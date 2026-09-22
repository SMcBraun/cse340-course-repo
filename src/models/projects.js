/*
====================================================================
FILE: src/models/projects.js
PURPOSE:
Data model for Service Projects. Handles SQL interactions with the 
'project' table and relational JOINs with the 'organization' table.
====================================================================
*/

import db from './db.js';

// ============================================================================
// ALL PROJECTS QUERY
// ============================================================================

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

// PLAIN ENGLISH: Retrieve all categories tagged to a single service project.
// LOGIC: Uses an INNER JOIN bridging category and project_category where project_id matches the input parameter.
// WHY WE NEED IT: Supplies category tag labels to the individual project details view (/project/:id).
// LEARNING GAP: Without joining through project_category, the project record has no direct foreign key to categories because of the many-to-many schema design.
async function getCategoriesByProjectId(projectId) {
  const query = `
        SELECT 
            c.category_id,
            c.name
        FROM category c
        INNER JOIN project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name ASC;
    `;
  const result = await db.query(query, [projectId]);
  return result.rows;
}

// ============================================================================
// CREATE PROJECT MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Save a brand new service project record into the database, linked to its host organization.
// LOGIC: An asynchronous INSERT query that adds a new row into the project table using the provided values, returning the new record's auto-generated ID.
// WHY WE NEED IT: Powers the "new service project" form so submitted data actually gets stored, associated with the correct organization.
// LEARNING GAP: The organizationId parameter is a foreign key -- it links this new row back to an existing row in the organization table, which is how the two tables stay connected.
const createProject = async (title, description, location, date, organizationId) => {
  const query = `
      INSERT INTO project (title, description, location, project_date, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING project_id;
    `;

  const queryParams = [title, description, location, date, organizationId];
  const result = await db.query(query, queryParams);

  if (result.rows.length === 0) {
    throw new Error('Failed to create project');
  }

  return result.rows[0].project_id;
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

export {
  getAllProjects,
  getProjectsByOrganizationId,
  getUpcomingProjects,
  getProjectDetails,
  getCategoriesByProjectId,
  createProject
};
