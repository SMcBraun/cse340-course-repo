/*
====================================================================
FILE: src/routes.js
PURPOSE:
This file acts as the central traffic controller (Router) for our 
entire application. Instead of cluttering server.js with individual 
URL endpoints, this file maps incoming browser requests to their 
specific controller functions.
====================================================================
*/

// ============================================================================
// CORE ROUTING IMPORTS
// ============================================================================

// PLAIN ENGLISH: Bring in Express so we can build a mini routing system.
// LOGIC: Imports the express library using modern ES Module syntax.
// WHY WE NEED IT: We need access to Express's built-in Router class to group endpoints cleanly outside of server.js.
// LEARNING GAP: Moving routes out of the main server object into an isolated router prevents server.js from turning into an unmaintainable "god file."
import express from 'express';

// ============================================================================
// CONTROLLER IMPORTS (The "Waiters" handling each page's logic)
// ============================================================================

// PLAIN ENGLISH: Import the home page controller from our controllers folder.
// LOGIC: Grabs the showHomePage function exported from ./controllers/index.js.
// WHY WE NEED IT: The router does not build HTML or fetch data itself; it relies on this function to decide what to show on the home page.
// LEARNING GAP: Keeps route paths completely decoupled from route logic, adhering strictly to the Controller layer of MVC.
import { showHomePage } from './controllers/index.js';

// PLAIN ENGLISH: Import the organizations page controller.
// LOGIC: Grabs the showOrganizationsPage function exported from ./controllers/organizations.js.
// WHY WE NEED IT: When someone visits /organizations, the router needs to know which controller contains the instructions to fetch partner data.
// LEARNING GAP: Demonstrates how controllers specialize—one file per major business domain instead of bundling everything into one script.
import { showOrganizationsPage } from './controllers/organizations.js';

// PLAIN ENGLISH: Import the projects page controller.
// LOGIC: Grabs the showProjectsPage function exported from ./controllers/projects.js.
// WHY WE NEED IT: Gives our router access to the function that queries projects from the database model and displays them.
// LEARNING GAP: Reinforces Separation of Concerns: the router handles the URL path, the controller manages the flow, and the model handles the database.
import { showProjectsPage } from './controllers/projects.js';

// PLAIN ENGLISH: Import the categories page controller.
// LOGIC: Grabs the showCategoriesPage function exported from ./controllers/categories.js.
// WHY WE NEED IT: Allows the router to hand off category requests to the dedicated category handler.
// LEARNING GAP: Completes feature parity with our database models by giving each viewable section its own dedicated controller module.
import { showCategoriesPage } from './controllers/categories.js';

// PLAIN ENGLISH: Import our custom error test handler.
// LOGIC: Grabs the testErrorPage function exported from ./controllers/errors.js.
// WHY WE NEED IT: Gives us a safe, controlled way to deliberately trigger a 500 server crash to verify our error template.
// LEARNING GAP: Testing failure paths intentionally ensures that crashes fail gracefully in production rather than showing raw stack traces to users.
import { testErrorPage } from './controllers/errors.js';

// ============================================================================
// ROUTER INITIALIZATION
// ============================================================================

// PLAIN ENGLISH: Create a mini-app router that holds all our page maps.
// LOGIC: Instantiates an isolated Express Router instance.
// WHY WE NEED IT: This router packages all our route paths together so server.js can mount them with a single line of code (app.use(router)).
// LEARNING GAP: Understanding the difference between `app` (the entire web server application) and `express.Router()` (a modular, mountable route container).
const router = express.Router();

// ============================================================================
// APPLICATION ROUTE DEFINITIONS
// ============================================================================

// PLAIN ENGLISH: When someone visits the root homepage URL ('/'), run the home page controller.
// LOGIC: Registers an HTTP GET listener for '/' and passes execution control directly to showHomePage.
// WHY WE NEED IT: Connects the browser's entry point to the template rendering logic.
// LEARNING GAP: Using named handler callbacks instead of inline anonymous functions `(req, res) => {}` keeps the routing table readable and clean.
router.get('/', showHomePage);

// PLAIN ENGLISH: When someone visits '/organizations', run the organizations controller.
// LOGIC: Registers an HTTP GET listener for '/organizations' mapped to showOrganizationsPage.
// WHY WE NEED IT: Directs visitors who want to see partner organizations to the controller that fetches that specific data.
// LEARNING GAP: The router acts purely as an address book—it maps URLs to functions without executing or writing queries itself.
router.get('/organizations', showOrganizationsPage);

// PLAIN ENGLISH: When someone visits '/projects', run the projects controller.
// LOGIC: Registers an HTTP GET listener for '/projects' mapped to showProjectsPage.
// WHY WE NEED IT: Directs the visitor to the handler that displays volunteer opportunities.
// LEARNING GAP: Replaces raw inline route definitions in server.js with an organized, scannable routing table.
router.get('/projects', showProjectsPage);

// PLAIN ENGLISH: When someone visits '/categories', run the categories controller.
// LOGIC: Registers an HTTP GET listener for '/categories' mapped to showCategoriesPage.
// WHY WE NEED IT: Connects the categories URL endpoint to the controller that coordinates the category model and view.
// LEARNING GAP: Standardizes endpoint architecture so every major section follows an identical pattern.
router.get('/categories', showCategoriesPage);

// ============================================================================
// ERROR-HANDLING DIAGNOSTIC ROUTE
// ============================================================================

// PLAIN ENGLISH: A test URL that deliberately causes an error to make sure our 500 error page works.
// LOGIC: Registers an HTTP GET listener for '/test-error' mapped to testErrorPage.
// WHY WE NEED IT: Provides a repeatable test route to simulate an unhandled server failure and verify our global error middleware.
// LEARNING GAP: Demonstrates how to write intentional error checkpoints to test error propagation without having to break production code.
router.get('/test-error', testErrorPage);

// ============================================================================
// MODULE EXPORT
// ============================================================================

// PLAIN ENGLISH: Export this finished map of routes so server.js can plug it in and use it.
// LOGIC: Exports the configured router object as the default export of this module.
// WHY WE NEED IT: Allows server.js to import this complete routing blueprint with `import router from './src/routes.js'`.
// LEARNING GAP: Leveraging ES Module exports to bundle application features into portable, independent components.
export default router;