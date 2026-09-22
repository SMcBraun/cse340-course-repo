// Import the categories model functions to access database records
import categoriesModel from '../models/categories.js';

// PLAIN ENGLISH: Import the project lookup so we can show the project's title at the top of the assign-categories form.
// LOGIC: Imports getProjectDetails from the projects model.
// WHY WE NEED IT: The assign-categories page needs to display which project the checkboxes belong to.
// LEARNING GAP: A controller can import from more than one model when a single page needs data from two related tables.
import { getProjectDetails } from '../models/projects.js';

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
        res.render('category', {
            title: category.category_name,
            category,
            projects
        });
    } catch (error) {
        // Send errors to the global error middleware
        next(error);
    }
};

// PLAIN ENGLISH: The waiter function that displays the checkbox form, pre-checking a project's currently assigned categories.
// LOGIC: Fetches the project details, every category in the system, and the categories already assigned to this project, then renders the form with all three.
// WHY WE NEED IT: The view needs all three pieces of data to draw the project title, every checkbox option, and which boxes start checked.
// LEARNING GAP: Fetching "all categories" and "this project's assigned categories" separately lets the view compare the two lists to decide each checkbox's state.
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

// PLAIN ENGLISH: The waiter function that receives the checked boxes and saves the new full set of category tags.
// LOGIC: Reads categoryIds from the form body, normalizes it into an array (since a single checked box arrives as one string, not an array), then calls updateCategoryAssignments.
// WHY WE NEED IT: Completes the assign-categories workflow by writing the user's checkbox choices back to the database.
// LEARNING GAP: HTML only sends an array for a repeated field name when two or more boxes are checked -- checking exactly one box sends a single plain value, so the code must handle both cases.
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

// Export the controller functions as a default object
export default {
    showCategories,
    showCategoryDetails,
    showAssignCategoriesForm,
    processAssignCategoriesForm
};
