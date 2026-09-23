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

// PLAIN ENGLISH: Insert one new link between a single project and a single category into the junction table.
// LOGIC: An asynchronous INSERT query adding one row to project_category with the given project and category IDs.
// WHY WE NEED IT: A many-to-many relationship (one project, many categories; one category, many projects) needs a linking table -- this function adds one link at a time.
// LEARNING GAP: This function is a small building block, only ever called from inside updateCategoryAssignments below, never directly from a controller.
const assignCategoryToProject = async (categoryId, projectId) => {
    const sql = `
    INSERT INTO project_category (category_id, project_id)
    VALUES ($1, $2);
  `;
    await db.query(sql, [categoryId, projectId]);
};

// PLAIN ENGLISH: Replace a project's entire set of category tags with a brand new set in one operation.
// LOGIC: First deletes every existing project_category row for this project, then loops through the new categoryIds array, calling assignCategoryToProject once per category.
// WHY WE NEED IT: Powers the "assign categories" checkbox form -- rebuilding the full set from scratch is simpler and safer than calculating exactly which boxes changed.
// LEARNING GAP: A delete-then-reinsert pattern avoids tricky logic for figuring out which links to add versus remove individually.
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const deleteSql = `
    DELETE FROM project_category
    WHERE project_id = $1;
  `;
    await db.query(deleteSql, [projectId]);

    for (const categoryId of categoryIds) {
        await assignCategoryToProject(categoryId, projectId);
    }
};

// PLAIN ENGLISH: Save a brand new category (like "Education") into the database.
// LOGIC: An asynchronous INSERT query that adds one row to the category table with the given name, returning the new row's auto-generated ID.
// WHY WE NEED IT: Powers the "New Category" form so a submitted name actually gets stored.
// LEARNING GAP: The $1 placeholder is a parameterized query -- the database treats the typed name strictly as data, never as SQL commands, which blocks SQL injection attacks.
const createCategory = async (name) => {
    const sql = `
    INSERT INTO public.category (name)
    VALUES ($1)
    RETURNING category_id;
  `;
    const result = await db.query(sql, [name]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    return result.rows[0].category_id;
};

// PLAIN ENGLISH: Change the name of one existing category.
// LOGIC: An asynchronous UPDATE query that finds the row by category_id ($2) and replaces its name with the new value ($1), returning the category_id to confirm a row was changed.
// WHY WE NEED IT: Powers the "Edit Category" form so users can fix a typo or rename a category without deleting it.
// LEARNING GAP: The WHERE clause is critical -- without it, UPDATE would rename EVERY category in the table. If no row comes back, the ID did not match anything, so we throw an error instead of pretending it worked.
const updateCategory = async (categoryId, name) => {
    const sql = `
    UPDATE public.category
    SET name = $1
    WHERE category_id = $2
    RETURNING category_id;
  `;
    const result = await db.query(sql, [name, categoryId]);

    if (result.rows.length === 0) {
        throw new Error('Category not found or failed to update');
    }

    return result.rows[0].category_id;
};

// Export all model functions using arrow notation
export default {
    getCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,
    updateCategory
};
