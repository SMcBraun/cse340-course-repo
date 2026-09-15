// Import the categories model functions to access database records
import categoriesModel from '../models/categories.js';

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

// Export the controller functions as a default object
export default {
    showCategories,
    showCategoryDetails
};