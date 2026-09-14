/*
====================================================================
FILE: src/models/categories.js
PURPOSE:
Data access layer responsible for all PostgreSQL interactions involving 
categories and their many-to-many relationships with service projects.
====================================================================
*/

import db from './db.js';

/*
PLAIN ENGLISH: Retrieve all categories in alphabetical order.
LOGIC: Executes a basic SELECT query ordered by the category name column.
WHY WE NEED IT: Populates the main /categories directory list.
LEARNING GAP: Letting PostgreSQL sort with ORDER BY is faster and less memory-intensive than sorting arrays in JavaScript.
*/
async function getAllCategories() {
    const query = 'SELECT * FROM category ORDER BY name ASC;';
    const result = await db.query(query);
    return result.rows;
}

/*
PLAIN ENGLISH: Retrieve the details of one specific category using its ID.
LOGIC: Uses a parameterized query (WHERE category_id = $1) to find the matching category record.
WHY WE NEED IT: Provides the title and identity for the category details page (/category/:id).
LEARNING GAP: Parameterized placeholders ($1) treat incoming values strictly as data, neutralizing SQL injection vulnerabilities.
*/
async function getCategoryById(id) {
    const query = 'SELECT * FROM category WHERE category_id = $1;';
    const result = await db.query(query, [id]);
    return result.rows[0];
}

/*
PLAIN ENGLISH: Retrieve all service projects associated with a given category.
LOGIC: Executes an INNER JOIN connecting the 'project' table to the 'project_category' 
junction table where category_id matches the requested ID, ordered by project date.
WHY WE NEED IT: Allows users on a category details page to see every service opportunity filed under that category.
LEARNING GAP: Many-to-many relationships require navigating through an associative junction table (project_category) to bridge entities.
*/
async function getProjectsByCategoryId(id) {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            o.name AS organization_name,
            o.organization_id
        FROM project p
        INNER JOIN project_category pc ON p.project_id = pc.project_id
        INNER JOIN organization o ON p.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date ASC;
    `;
    const result = await db.query(query, [id]);
    return result.rows;
}

export {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId
};