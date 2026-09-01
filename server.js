// LOGIC: Imports the core Express framework using ESM syntax.
// LEARNING GAP: Switches from legacy CommonJS (require) to modern ES Modules (import), aligning with current JavaScript standards.
import express from 'express';

// LOGIC: Imports a utility function from the Node.js URL module to convert module file URLs to file paths.
// LEARNING GAP: ES Modules do not automatically provide __filename or __dirname like CommonJS, so we must construct them manually.
import { fileURLToPath } from 'url';

// LOGIC: Imports the native Node.js path module to safely join and manipulate file directory paths across operating systems.
// LEARNING GAP: Prevents broken path errors caused by OS differences (e.g., Windows backslashes vs. Linux forward slashes).
import path from 'path';

// LOGIC: Reads the environment variable NODE_ENV or defaults to 'production' if undefined.
// LEARNING GAP: Demonstrates how servers adapt behavior based on host configuration environments (e.g., local development vs. Render hosting).
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// LOGIC: Reads the PORT environment variable assigned by the hosting provider or defaults to local port 3000.
// LEARNING GAP: Cloud hosts like Render assign dynamic ports at runtime, so hardcoding a single port number causes deployment failure.
const PORT = process.env.PORT || 3000;

// LOGIC: Converts the current module's URL string into an absolute file path string.
// LEARNING GAP: Recreates the absolute path variable needed for reliable directory navigation in ES Module setups.
const __filename = fileURLToPath(import.meta.url);

// LOGIC: Extracts the directory name from the absolute file path.
// LEARNING GAP: Establishes a relative anchor point to locate views and static folders regardless of where the app is launched.
const __dirname = path.dirname(__filename);

// LOGIC: Initializes a new Express application instance.
// LEARNING GAP: Creates the core server object that manages middleware, routing, and HTTP responses.
const app = express();

/**
  * Configure Express middleware
  */

// LOGIC: Mounts static file serving middleware targeting the 'public' directory.
// LEARNING GAP: Instructs Express to serve CSS, images, and client JS directly without needing individual route handlers for every file.
app.use(express.static('public'));

// LOGIC: Sets EJS as the default template rendering engine for the Express app.
// LEARNING GAP: Allows Express to parse .ejs files and render server-side HTML dynamically using res.render().
app.set('view engine', 'ejs');

// LOGIC: Defines the absolute path to the folder where EJS template files are stored.
// LEARNING GAP: Directs the view engine to src/views so res.render('home') automatically finds src/views/home.ejs.
app.set('views', path.join(__dirname, 'src/views'));

/**
  * Routes
  */

// LOGIC: Registers an async HTTP GET route handler for the root path ('/').
// LEARNING GAP: Connects the base website URL request directly to the home template rendering logic.
app.get('/', async (req, res) => {
    // LOGIC: Assigns a string variable holding the page title.
    // LEARNING GAP: Demonstrates passing dynamic server state into EJS templates.
    const title = 'Home';
    // LOGIC: Renders the home.ejs template and injects the title object.
    // LEARNING GAP: Converts the EJS blueprint and dynamic data into plain HTML sent back to the visitor's browser.
    res.render('home', { title });
});

// LOGIC: Registers an async HTTP GET route handler for '/organizations'.
// LEARNING GAP: Maps specific URL endpoints to distinct view templates across the application.
app.get('/organizations', async (req, res) => {
    // LOGIC: Assigns a string variable holding the page title.
    // LEARNING GAP: Dynamically customizes page metadata per route.
    const title = 'Our Partner Organizations';
    // LOGIC: Renders the organizations.ejs template.
    // LEARNING GAP: Reuses the single EJS render mechanism to output distinct page content.
    res.render('organizations', { title });
});

// LOGIC: Registers an async HTTP GET route handler for '/projects'.
// LEARNING GAP: Expands application routing architecture following a consistent design pattern.
app.get('/projects', async (req, res) => {
    // LOGIC: Assigns a string variable holding the page title.
    // LEARNING GAP: Maintains dynamic data passing across all project views.
    const title = 'Service Projects';
    // LOGIC: Renders the projects.ejs template.
    // LEARNING GAP: Delivers the project list view HTML to the client browser.
    res.render('projects', { title });
});

// LOGIC: Registers a new async HTTP GET route handler for '/categories'.
// LEARNING GAP: Completes assignment expansion requirements by linking the new UI page to server execution logic.
app.get('/categories', async (req, res) => {
    // LOGIC: Assigns a string variable holding the page title.
    // LEARNING GAP: Ensures the categories page receives a dynamic title for the browser tab.
    const title = 'Project Categories';
    // LOGIC: Renders the categories.ejs template and injects the title object.
    // LEARNING GAP: Connects the new categories.ejs file directly to incoming client HTTP requests.
    res.render('categories', { title });
});

// LOGIC: Binds and listens for incoming connections on the specified PORT.
// LEARNING GAP: Converts the configured Express application into an active, running server accepting requests.
const server = app.listen(PORT, () => {
    // LOGIC: Logs server startup success and active port to the console.
    // LEARNING GAP: Provides developer feedback in terminal logs confirming local or remote execution status.
    console.log(`Server is running on port ${PORT}`);
    // LOGIC: Logs the active environment mode to the console.
    // LEARNING GAP: Confirms whether the app is executing under development or production rules.
    console.log(`Environment: ${NODE_ENV}`);
});