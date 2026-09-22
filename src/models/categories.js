// Import database pool connection
import db from './db.js';

// Retrieve all categories ordered alphabetically
const getCategories = async () => {
    const sql = 'SELECT category_id, name FROM public.category ORDER BY name ASC;';
    const result = await db.query(sql);
    return result.rows;
};

// Retrieve a single category by primary key ID
const getCategoryById = async (id) => {
    const sql = 'SELECT category_id, name FROM public.category WHERE category_id = $1;';
    const result = await db.query(sql, [id]);
    return result.rows[0];
};

const getProjectsByCategoryId = async (categoryId) => {
    const sql = `
    SELECT p.project_id, p.title, p.description, p.project_date,
           o.organization_id, o.name AS organization_name
    FROM public.project p
    JOIN public.project_category pc ON p.project_id = pc.project_id
    JOIN public.organization o ON p.organization_id = o.organization_id
    WHERE pc.category_id = $1
    ORDER BY p.title ASC;
  `;
    const result = await db.query(sql, [categoryId]);
    return result.rows;
};


// Retrieve all category tags for a given service project
const getCategoriesByProjectId = async (projectId) => {
    const sql = `
    SELECT c.category_id, c.name
    FROM public.category c
    JOIN public.project_category pc ON c.category_id = pc.category_id
    WHERE pc.project_id = $1
    ORDER BY c.name ASC;
  `;
    const result = await db.query(sql, [projectId]);
    return result.rows;
};

// Export all model functions using arrow notation
export default {
    getCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByProjectId
};

