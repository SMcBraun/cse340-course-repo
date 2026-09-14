/*
====================================================================
FILE: src/controllers/categories.js
PURPOSE:
Controller handling HTTP requests for category listing and granular 
category detail views with associated projects.
====================================================================
*/

import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId
} from '../models/categories.js';

/*
PLAIN ENGLISH: Handles the request to view the main list of all categories.
LOGIC: Invokes getAllCategories from the model and renders the categories.ejs template.
WHY WE NEED IT: Powers the /categories route.
LEARNING GAP: The controller remains lean by letting the model execute the query and the view structure the markup.
*/
async function showCategoriesPage(req, res, next) {
    try {
        const categories = await getAllCategories();
        res.render('categories', {
            title: 'Categories',
            categories
        });
    } catch (error) {
        next(error);
    }
}

/*
PLAIN ENGLISH: Handles requests for a single category detail page (/category/:id).
LOGIC: Extracts req.params.id, retrieves the category info and its associated projects, and passes them to category.ejs.
WHY WE NEED IT: Fulfills the requirement to see all service opportunities under a chosen category.
LEARNING GAP: If the requested category ID doesn't exist in the database, we instantiate a 404 error rather than rendering a blank broken view.
*/
async function showCategoryDetailsPage(req, res, next) {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);

        if (!category) {
            const err = new Error(`Category with ID ${categoryId} not found`);
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByCategoryId(categoryId);

        res.render('category', {
            title: `${category.name} Projects`,
            category,
            projects
        });
    } catch (error) {
        next(error);
    }
}

// Notice both functions are exported here:
export {
    showCategoriesPage,
    showCategoryDetailsPage
};