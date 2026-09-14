/*
====================================================================
FILE: src/controllers/projects.js
PURPOSE:
Acts as the coordinator (Controller) between the projects data model 
and the projects EJS view template.
====================================================================
*/

// ============================================================================
// MODEL IMPORTS
// ============================================================================

// PLAIN ENGLISH: Import the project-fetching recipe from our models directory.
// LOGIC: Imports getAllProjects from ../models/projects.js using relative directory navigation.
// WHY WE NEED IT: Controllers delegate database queries to models so SQL logic stays isolated from request coordination.
// LEARNING GAP: Reinforces the MVC boundary: controllers must never construct or execute raw SQL queries directly.
import { getAllProjects } from '../models/projects.js';

// ============================================================================
// CONTROLLER HANDLER FUNCTIONS
// ============================================================================

// PLAIN ENGLISH: The waiter function that retrieves project records and renders the projects catalog.
// LOGIC: An asynchronous controller function that awaits asynchronous database model operations.
// WHY WE NEED IT: Manages the request lifecycle for the '/projects' route endpoint.
// LEARNING GAP: Using async/await prevents race conditions by ensuring database rows are fully fetched before compilation begins.
const showProjectsPage = async (req, res) => {
    // PLAIN ENGLISH: Ask the database model to fetch all available service projects and pause until it finishes.
    // LOGIC: Awaits the promise returned by getAllProjects() and stores the resolved array in 'projects'.
    // WHY WE NEED IT: Obtains the live dataset required to render dynamic project cards in the user interface.
    // LEARNING GAP: Asynchronous data flow in Node.js requires explicit awaiting to prevent sending undefined variables to views.
    const projects = await getAllProjects();

    // PLAIN ENGLISH: Set the tab name for the user's browser window.
    // LOGIC: Instantiates a string literal assigned to variable 'title'.
    // WHY WE NEED IT: Informs the shared header partial of the correct page heading and tab label.
    // LEARNING GAP: Demonstrates combining static metadata with dynamic database records into a single template payload.
    const title = 'Service Projects';

    // PLAIN ENGLISH: Send both the title and the database project rows into the projects.ejs view template.
    // LOGIC: Invokes res.render() to compile src/views/projects.ejs with title and projects in the local scope.
    // WHY WE NEED IT: Translates database rows into HTML table rows or cards for the client browser.
    // LEARNING GAP: The View layer handles presentation looping (<% projects.forEach(...) %>), while the controller strictly supplies the data array.
    res.render('projects', { title, projects });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export this function so our router can map it to the '/projects' URL.
// LOGIC: Uses ES Module syntax to export showProjectsPage as a named function.
// WHY WE NEED IT: Allows src/routes.js to bind this logic to incoming HTTP GET requests.
// LEARNING GAP: Isolates project feature logic into its own domain file rather than crowding general controller files.
export { showProjectsPage };