/*
====================================================================
FILE: src/models/projects.js
PURPOSE:
Acts as the dedicated data-access layer for Service Projects.
It handles all direct SQL queries sent to the PostgreSQL database
so that our database logic remains decoupled from route handlers.

LEARNING GAP / RATIONALE:
A project belongs to an organization, but its table only stores the 
organization's numeric ID (a foreign key). To display the actual 
readable organization name on the website, we use an SQL INNER JOIN.
This connects the project record to the matching organization record 
in a single efficient network call, avoiding slow multiple queries.

VALUE:
Encapsulates all database mechanics here. If the schema or column
names ever change, we only modify this single file rather than 
searching through all application routes.
====================================================================
*/

// LOGIC: Import the shared connection pool.
// VALUE: Reuses open database sockets instead of creating new connections for each request.
import db from './db.js';

// FUNCTION: getAllProjects
// PURPOSE: Retrieves all service projects combined with their sponsoring organization names.
const getAllProjects = async () => {

    // LOGIC: Explicitly SELECT required columns and use INNER JOIN to link both tables.
    // LEARNING GAP: We join `project` with `organization` where the IDs match so we get `org_name`.
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.location, 
            p.project_date, 
            o.name AS organization_name
        FROM public.project p
        INNER JOIN public.organization o ON p.organization_id = o.organization_id
        ORDER BY p.project_date ASC;
    `;

    // LOGIC: Pause and wait for PostgreSQL to finish executing over the network.
    const result = await db.query(query);

    // VALUE: Return only the array of data rows, leaving behind metadata.
    return result.rows;
};

// LOGIC: Export the function so server.js can import and use it in route handlers.
export { getAllProjects };