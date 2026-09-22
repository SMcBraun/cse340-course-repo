/*
====================================================================
FILE: src/models/organizations.js
PURPOSE:
This file acts as our data model for Organizations. It handles all
direct communication with the PostgreSQL database table for organizations.
====================================================================
*/

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

  return result.rows.length > 0 ? result.rows[0] : null;
};

// ============================================================================
// CREATE ORGANIZATION MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Save a brand new organization record into the database.
// LOGIC: An asynchronous INSERT query that adds a new row and returns the new record's auto-generated ID.
// WHY WE NEED IT: Powers the "new organization" form so submitted data actually gets stored.
// LEARNING GAP: The RETURNING clause hands back the new primary key immediately, without needing a second lookup query.
const createOrganization = async (name, description, contactEmail, logoFilename) => {
  const query = `
      INSERT INTO organization (name, description, contact_email, logo_filename)
      VALUES ($1, $2, $3, $4)
      RETURNING organization_id
    `;

  const queryParams = [name, description, contactEmail, logoFilename];
  const result = await db.query(query, queryParams);

  return result.rows[0].organization_id;
};

// ============================================================================
// UPDATE ORGANIZATION MODEL QUERY
// ============================================================================

// PLAIN ENGLISH: Overwrite an existing organization's details with new, edited values.
// LOGIC: An asynchronous UPDATE query that modifies the row matching the given organization_id, setting each column to its new value.
// WHY WE NEED IT: Powers the "edit organization" form so changes made by the user are saved back to the database.
// LEARNING GAP: UPDATE targets an existing row using WHERE, unlike INSERT which always creates a brand new one.
const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
  const query = `
      UPDATE organization
      SET name = $1, description = $2, contact_email = $3, logo_filename = $4
      WHERE organization_id = $5
      RETURNING organization_id;
    `;

  const queryParams = [name, description, contactEmail, logoFilename, organizationId];
  const result = await db.query(query, queryParams);

  if (result.rows.length === 0) {
    throw new Error('Organization not found');
  }

  return result.rows[0].organization_id;
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export all database query tools so controllers can use them.
// LOGIC: Uses ES Module named export syntax to make each model function accessible.
// WHY WE NEED IT: Allows our controllers (src/controllers/organizations.js) to import and call these functions.
// LEARNING GAP: Named exports allow us to bundle multiple focused query functions in a single model file.
export { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization };
