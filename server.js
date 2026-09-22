/*
====================================================================
FILE: server.js
PURPOSE:
The primary bootstrap file and engine room of our application. 
Under MVC architecture, this file is responsible ONLY for initializing 
the Express app, mounting global middleware, mounting the central router, 
and listening for incoming network connections.
====================================================================
*/

// ============================================================================
// DATA & INFRASTRUCTURE IMPORTS
// ============================================================================

// PLAIN ENGLISH: Grab our database health-checker from db.js.
// LOGIC: Imports the testConnection utility from the models folder.
// WHY WE NEED IT: When the server starts up, we use this to verify our database credentials work and our database is alive.
// LEARNING GAP: Testing the connection right at startup catches database issues immediately rather than waiting for a user to hit an error page.
import { testConnection } from './src/models/db.js';

// NOTE ON MVC REFACTORING:
// We previously imported getAllOrganizations, getAllProjects, and getAllCategories here.
// In MVC, those imports are REMOVED from server.js and placed inside their respective
// controller files (src/controllers/) because the server file should never talk directly to models.

// PLAIN ENGLISH: Imports the core Express framework using modern ES Modules.
// LOGIC: Imports express default export using ESM syntax instead of require().
// WHY WE NEED IT: Provides the foundational web framework to handle HTTP requests and middleware.
// LEARNING GAP: Switches from legacy CommonJS (require) to modern ES Modules (import), aligning with current JavaScript standards.
import express from 'express';

import session from 'express-session';
import flash from './src/middleware/flash.js';

// PLAIN ENGLISH: Tool to convert file URLs into standard file path strings.
// LOGIC: Imports fileURLToPath from the native Node.js 'url' module.
// WHY WE NEED IT: In modern ES Modules, __dirname and __filename are not provided by default, so we construct them manually.
// LEARNING GAP: ESM uses URLs (import.meta.url) instead of filesystem strings; this utility bridges the gap.
import { fileURLToPath } from 'url';

// PLAIN ENGLISH: Tool to join folder and file names safely across all operating systems.
// LOGIC: Imports the native Node.js 'path' module.
// WHY WE NEED IT: Ensures paths work consistently across Windows (backslashes) and Mac/Linux (forward slashes).
// LEARNING GAP: Prevents deployment bugs when moving code from a local Windows or Mac laptop to a Linux hosting server like Render.
import path from 'path';

// PLAIN ENGLISH: Bring in our centralized router that contains all of our application URL maps.
// LOGIC: Imports the default router instance created in src/routes.js.
// WHY WE NEED IT: Under MVC, server.js delegates endpoint routing to src/routes.js so the server file stays clean.
// LEARNING GAP: Demonstrates Separation of Concerns by decoupling server configuration from URL path definitions.
import router from './src/routes.js';

// ============================================================================
// ENVIRONMENT & PATH CONFIGURATION
// ============================================================================

// PLAIN ENGLISH: Figure out if we are running in "development" mode on our laptop or "production" mode on Render.
// LOGIC: Reads process.env.NODE_ENV safely, normalizes it to lowercase, or defaults to 'production'.
// WHY WE NEED IT: Lets us show helpful error traces locally while hiding sensitive bugs from the public internet.
// LEARNING GAP: Demonstrates how servers adapt behavior dynamically based on hosting environment configurations.
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// PLAIN ENGLISH: Pick the port number where our server will listen for web traffic.
// LOGIC: Uses process.env.PORT provided by the host, falling back to local port 3000.
// WHY WE NEED IT: Cloud providers like Render assign dynamic ports randomly; hardcoding a port causes deployment crashes.
// LEARNING GAP: Prevents cloud deployment crashes by using environment-driven configuration instead of hardcoded numbers.
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;



// PLAIN ENGLISH: Determine the exact file name and directory path where this server file lives on the computer.
// LOGIC: Converts import.meta.url to a file path and retrieves its containing directory.
// WHY WE NEED IT: Gives Express an absolute anchor point to find our views, public folders, and assets.
// LEARNING GAP: Re-creates the missing __dirname variable needed for path resolution in ES Module environments.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// SERVER INITIALIZATION & CONFIGURATION
// ============================================================================

// PLAIN ENGLISH: Build the actual Express application engine.
// LOGIC: Instantiates a new Express application instance stored in 'app'.
// WHY WE NEED IT: 'app' is the central engine that holds all our middleware, template engine settings, and routes.
// LEARNING GAP: Differentiates between importing the abstract Express library and instantiating an active, runnable server app.
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// PLAIN ENGLISH: Make the public folder (CSS, images, front-end files) available to anyone visiting the site.
// LOGIC: Mounts static file middleware pointing to the absolute path of the public directory.
// WHY WE NEED IT: Lets the browser load styles and logos directly without needing a manual route for every single asset.
// LEARNING GAP: Instructs Express to serve static assets automatically instead of writing custom route handlers for images and styles.
app.use(express.static(path.join(__dirname, 'public')));

// PLAIN ENGLISH: Tell Express to use EJS as the blueprint tool for rendering web pages.
// LOGIC: Configures Express's 'view engine' setting to 'ejs'.
// WHY WE NEED IT: Allows us to use res.render() to combine dynamic server data with HTML layouts.
// LEARNING GAP: Links Express to a templating engine so we can create server-rendered dynamic HTML.
app.set('view engine', 'ejs');

// PLAIN ENGLISH: Tell Express where our HTML/EJS blueprint files are stored.
// LOGIC: Sets the 'views' lookup directory to the absolute path of src/views.
// WHY WE NEED IT: Tells res.render('home') to look specifically inside src/views/home.ejs.
// LEARNING GAP: Prevents "Failed to lookup view" errors by establishing a reliable, absolute views directory path.
app.set('views', path.join(__dirname, 'src/views'));

// ============================================================================
// GLOBAL MIDDLEWARE PIPELINE
// ============================================================================

// Set up session management
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour of inactivity
}));

// Use flash message middleware
app.use(flash);



// PLAIN ENGLISH: Checkpoint that prints every page request to our terminal when working locally.
// LOGIC: Inspects req.method and req.url, logging them to console only if NODE_ENV is development.
// WHY WE NEED IT: Allows developers to monitor incoming HTTP traffic and debug endpoint calls in real time.
// LEARNING GAP: Demonstrates how generic middleware uses next() to log requests before passing control down the pipeline.
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); // Pass control to the next middleware or route
});

// PLAIN ENGLISH: Pass our environment variable (development or production) to every EJS template automatically.
// LOGIC: Attaches NODE_ENV to the res.locals context object.
// WHY WE NEED IT: Makes NODE_ENV globally accessible to footer.ejs and error templates without re-passing it in every single render call.
// LEARNING GAP: Demonstrates res.locals as the shared data bridge between server middleware and EJS presentation templates.
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// ============================================================================
// MVC ROUTING INTEGRATION
// ============================================================================

// PLAIN ENGLISH: Plug in all of our web pages and controller routes from src/routes.js.
// LOGIC: Mounts the external router middleware onto the Express application instance.
// WHY WE NEED IT: Replaces dozens of messy inline app.get() routes with a clean, single-line delegation to the router.
// LEARNING GAP: Implements the MVC Controller layer entry point, completely uncluttering server.js.
app.use(router);

// ============================================================================
// ERROR HANDLING PIPELINE
// ============================================================================

// PLAIN ENGLISH: If a request makes it past all routes without a match, create a 404 error.
// LOGIC: Catch-all middleware that instantiates an Error object with status 404 and calls next(err).
// WHY WE NEED IT: Standard Express treats missing routes by falling through; this explicitly captures unmatched URLs as 404s.
// LEARNING GAP: Calling next(err) skips all regular middleware and immediately forwards execution to the global error handler.
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// PLAIN ENGLISH: The safety net that catches all errors (404s, 500s, crashes) and displays a nice error page.
// LOGIC: A 4-parameter error-handling middleware (err, req, res, next) that renders custom error templates.
// WHY WE NEED IT: Prevents the server from crashing or exposing raw stack traces to everyday visitors.
// LEARNING GAP: Express identifies error middleware strictly by its 4-parameter signature (err, req, res, next).
app.use((err, req, res, next) => {
    // PLAIN ENGLISH: Print the technical error details in our terminal for the developer to fix.
    // LOGIC: Logs the error message and the full code execution stack trace to stderr.
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);

    // PLAIN ENGLISH: Determine whether this is a missing page (404) or a code failure (500).
    // LOGIC: Reads err.status defaulting to 500, selecting '404' or '500' template names.
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // PLAIN ENGLISH: Bundle the error details into a package for the EJS view template.
    // LOGIC: Creates a context data object holding title, error message, and debug stack.
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    // PLAIN ENGLISH: Send back the correct HTTP status code and draw the custom error page.
    // LOGIC: Sets the HTTP response status code and executes res.render() targeting src/views/errors/.
    res.status(status).render(`errors/${template}`, context);
});

// ============================================================================
// SERVER STARTUP & DATABASE VERIFICATION
// ============================================================================

// PLAIN ENGLISH: Turn on the server to listen for web visitors and verify our database connection.
// LOGIC: Calls app.listen() to bind the server to PORT, executing an async startup callback that calls testConnection().
// WHY WE NEED IT: Binds the application to the network port and immediately confirms database health on boot.
// LEARNING GAP: Converts the inactive server configuration into an active, listening network process.
const server = app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});

