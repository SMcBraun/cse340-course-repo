// Import the categories model functions to access database records
import categoriesModel from '../models/categories.js';

// PLAIN ENGLISH: Import the project lookup so we can show the project's title at the top of the assign-categories form.
// LOGIC: Imports getProjectDetails from the projects model.
// WHY WE NEED IT: The assign-categories page needs to display which project the checkboxes belong to.
// LEARNING GAP: A controller can import from more than one model when a single page needs data from two related tables.
import { getProjectDetails } from '../models/projects.js';

// PLAIN ENGLISH: Import the tools the server uses to check form data before trusting it.
// LOGIC: body() creates a rule for one form field; validationResult() collects any rules that failed.
// WHY WE NEED IT: The create and edit category forms must be checked on the server, not just in the browser.
// LEARNING GAP: Browser checks can be skipped or turned off, so the server must always double-check the data itself.
import { body, validationResult } from 'express-validator';

// ============================================================================
// VALIDATION RULES
// ============================================================================

// PLAIN ENGLISH: The server's checklist for a category name: it must be present and between 3 and 100 characters.
// LOGIC: One express-validator chain targeting the "name" form field -- trim spaces, require a value, then check the length.
// WHY WE NEED IT: Guarantees a blank, too-short, or too-long category name can never be saved to the database.
// LEARNING GAP: The 3-character minimum is on the server ONLY (not in the HTML form) on purpose, so we can prove the server-side check works by typing a 2-letter name.
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters')
];

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

// Controller: Display all categories on the /categories page
// Uses ES6 async arrow function notation assigned to a const variable
const showCategories = async (req, res, next) => {
    try {
        // Retrieve all categories from the database via the model
        const categories = await categoriesModel.getCategories();

        // Render the categories.ejs view directly from src/views/
        res.render('categories', {
            title: 'Categories',
            categories
        });
    } catch (error) {
        // Send errors to the global error middleware
        next(error);
    }
};

// Controller: Display the category details page on /category/:id
// Uses ES6 async arrow function notation assigned to a const variable
const showCategoryDetails = async (req, res, next) => {
    try {
        // Grab the category id from URL route parameters
        const categoryId = req.params.id;

        // Concurrently fetch both the category details and all associated projects
        const [category, projects] = await Promise.all([
            categoriesModel.getCategoryById(categoryId),
            categoriesModel.getProjectsByCategoryId(categoryId)
        ]);

        // If the category does not exist, trigger a 404 error
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }

        // Render the category.ejs view directly from src/views/
        // The title uses category.name because that is the column name the model query returns
        res.render('category', {
            title: category.name,
            category,
            projects
        });
    } catch (error) {
        // Send errors to the global error middleware
        next(error);
    }
};

// PLAIN ENGLISH: The server shows the checkbox form, with a project's current categories already checked.
// LOGIC: Fetches the project details, every category in the system, and the categories already assigned to this project, then renders the form with all three.
// WHY WE NEED IT: The page needs all three pieces of data to show the project title, every checkbox option, and which boxes start checked.
// LEARNING GAP: Fetching "all categories" and "this project's assigned categories" separately lets the page compare the two lists to decide each checkbox's state.
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const projectDetails = await getProjectDetails(projectId);
        const categories = await categoriesModel.getCategories();
        const assignedCategories = await categoriesModel.getCategoriesByProjectId(projectId);

        const title = 'Assign Categories to Project';

        res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
    } catch (error) {
        next(error);
    }
};

// PLAIN ENGLISH: The server receives the checked boxes and saves the new full set of categories for the project.
// LOGIC: Reads categoryIds from the form body, turns it into a list (since a single checked box arrives as one value, not a list), then calls updateCategoryAssignments.
// WHY WE NEED IT: Completes the assign-categories feature by saving the user's checkbox choices to the database.
// LEARNING GAP: The browser only sends a list when two or more boxes are checked -- checking exactly one box sends a single plain value, so the code must handle both cases.
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const selectedCategoryIds = req.body.categoryIds || [];

        const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];

        await categoriesModel.updateCategoryAssignments(projectId, categoryIdsArray);

        req.flash('success', 'Categories updated successfully.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

// PLAIN ENGLISH: The server shows the blank "New Category" form.
// LOGIC: Sets the page title and renders new-category.ejs -- no database lookup is needed because the form starts empty.
// WHY WE NEED IT: Gives users a page at /new-category where they can type a new category name.
// LEARNING GAP: Unlike the new project form, there is no dropdown here, so the server does not need to fetch any extra data first.
const showNewCategoryForm = async (req, res, next) => {
    try {
        const title = 'Add New Category';
        res.render('new-category', { title });
    } catch (error) {
        next(error);
    }
};

// PLAIN ENGLISH: The server receives the new category name, checks it, and saves it.
// LOGIC: Checks the validation results first; if anything failed, shows each error message and sends the user back to the form. If everything passed, saves the category and sends the user to its details page with a success message.
// WHY WE NEED IT: Completes the create-category feature -- database save, flash message, and page redirect, as the rubric requires.
// LEARNING GAP: The try/catch lets the server show a friendly error message instead of crashing -- for example, if the database rejects a duplicate category name.
const processNewCategoryForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/new-category');
    }

    const { name } = req.body;

    try {
        const newCategoryId = await categoriesModel.createCategory(name);

        req.flash('success', 'New category created successfully!');
        res.redirect(`/category/${newCategoryId}`);
    } catch (error) {
        console.error('Error creating new category:', error);
        req.flash('error', 'There was an error creating the category.');
        res.redirect('/new-category');
    }
};

// PLAIN ENGLISH: The server looks up one category and shows the edit form, already filled in with its current name.
// LOGIC: Reads the category ID from the web address, gets that category from the database, and renders edit-category.ejs with it. If no category matches, it sends a 404 "not found" error.
// WHY WE NEED IT: The user needs to see the current name before changing it -- the rubric requires the edit form to be pre-filled.
// LEARNING GAP: The ID comes from the web address (req.params.id), but the current name comes from the database -- knowing WHICH category is not the same as knowing WHAT it is called.
const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await categoriesModel.getCategoryById(categoryId);

        if (!category) {
            const err = new Error(`Category with ID ${categoryId} not found`);
            err.status = 404;
            return next(err);
        }

        const title = 'Edit Category';
        res.render('edit-category', { title, category });
    } catch (error) {
        next(error);
    }
};

// PLAIN ENGLISH: The server receives the edited category name, checks it, and saves the change.
// LOGIC: Checks the validation results first; if anything failed, shows each error message and sends the user back to this category's edit form. If everything passed, saves the new name and sends the user to the category's details page with a success message.
// WHY WE NEED IT: Completes the edit-category feature -- database update, flash message, and page redirect, as the rubric requires.
// LEARNING GAP: The category ID comes from the web address (req.params.id), while the new name comes from the form (req.body) -- two different places on the same request.
const processEditCategoryForm = async (req, res) => {
    const categoryId = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/edit-category/${categoryId}`);
    }

    const { name } = req.body;

    try {
        await categoriesModel.updateCategory(categoryId, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'There was an error updating the category.');
        res.redirect(`/edit-category/${categoryId}`);
    }
};

// Export the controller functions as a default object
export default {
    showCategories,
    showCategoryDetails,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
};
