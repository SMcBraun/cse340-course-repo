/*
====================================================================
FILE: src/controllers/categories.js
PURPOSE:
Acts as the coordinator (Controller) between the category data model 
and the categories EJS view template.
====================================================================
*/

// ============================================================================
// MODEL IMPORTS
// ============================================================================

// PLAIN ENGLISH: Bring in our database query function that fetches project categories.
// LOGIC: Imports the getAllCategories query helper from ../models/categories.js.
// WHY WE NEED IT: The controller needs a designated data pipeline to read category rows from the PostgreSQL database.
// LEARNING GAP: Demonstrates uniform model design: each relational table has an equivalent model module supplying query functions.
import { getAllCategories } from '../models/categories.js';

// ============================================================================
// CONTROLLER HANDLER FUNCTIONS
// ============================================================================

// PLAIN ENGLISH: The waiter function that handles requests to view the service categories list.
// LOGIC: Defines an asynchronous handler executing a database query and compiling a view.
// WHY WE NEED IT: Serves as the callback handler for the '/categories' route in our router.
// LEARNING GAP: Demonstrates robust controller design by isolating domain requests into single-purpose functions.
const showCategoriesPage = async (req, res) => {
    // PLAIN ENGLISH: Wait for our model to go to the database and retrieve all category records.
    // LOGIC: Awaits the resolution of getAllCategories() and assigns the result array to 'categories'.
    // WHY WE NEED IT: Halts controller execution until the database response is fully received into memory.
    // LEARNING GAP: Prevents the server from rendering incomplete views before database transactions settle.
    const categories = await getAllCategories();

    // PLAIN ENGLISH: Set the browser tab label for the categories screen.
    // LOGIC: Defines the string variable 'title' for header injection.
    // WHY WE NEED IT: Maintains visual consistency across all view layouts.
    // LEARNING GAP: Provides consistent user orientation across multiple routes within the same layout shell.
    const title = 'Service Categories';

    // PLAIN ENGLISH: Merge the category data into categories.ejs and send the finished HTML page to the browser.
    // LOGIC: Renders src/views/categories.ejs passing an object containing title and categories.
    // WHY WE NEED IT: Concludes the HTTP request-response cycle by delivering the rendered markup to the client.
    // LEARNING GAP: Decouples rendering technology from routing logic; changing template engines would only require adjusting this line.
    res.render('categories', { title, categories });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export this function so our routing file can link it to the '/categories' address.
// LOGIC: Exports showCategoriesPage as a named ES Module export.
// WHY WE NEED IT: Exposes the category handling functionality to src/routes.js.
// LEARNING GAP: Keeps module boundaries explicit and prevents unnecessary global scope leakage.
export { showCategoriesPage };