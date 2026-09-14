/*
====================================================================
FILE: src/controllers/projects.js
PURPOSE:
Coordinates data flow between the Project model and the project views.
====================================================================
*/

// PLAIN ENGLISH: Import our database query methods for upcoming projects and single project lookups.
// LOGIC: Imports getUpcomingProjects and getProjectDetails from the project model.
// WHY WE NEED IT: Allows this controller to fetch dynamic service project datasets.
// LEARNING GAP: Controllers orchestrate business logic; they never write SQL or access the database directly.
import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

// PLAIN ENGLISH: Define a configuration constant so we can change the limit in one place.
// LOGIC: Constant holding the integer 5 to pass into the database LIMIT clause.
// WHY WE NEED IT: Prevents "magic numbers" in our code and makes maintenance simple.
// LEARNING GAP: Using named constants improves code readability and centralizes application rules.
const NUMBER_OF_UPCOMING_PROJECTS = 5;

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

// PLAIN ENGLISH: Gather the next 5 upcoming projects and display them on the main projects list page.
// LOGIC: Asynchronous controller action that calls getUpcomingProjects(5) and renders projects.ejs.
// WHY WE NEED IT: Serves GET /projects with only timely, actionable volunteer events.
// LEARNING GAP: Filtering and limiting at the database layer is far more efficient than fetching all rows and filtering in JavaScript.
const showProjectsPage = async (req, res) => {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    const title = 'Upcoming Service Projects';
    res.render('projects', { title, projects });
};

// PLAIN ENGLISH: Retrieve the details of one specific project and display its dedicated page.
// LOGIC: Extracts :id from req.params, queries the model, and renders project.ejs.
// WHY WE NEED IT: Serves GET /project/:id for granular project review.
// LEARNING GAP: Capturing route parameters with req.params maps clean, readable URLs directly to database primary keys.
const showProjectDetailsPage = async (req, res) => {
    const projectId = req.params.id;
    const project = await getProjectDetails(projectId);
    const title = project ? project.title : 'Project Details';
    res.render('project', { title, project });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export controller handler functions so the router can bind them to URLs.
// LOGIC: ES Module named exports.
export { showProjectsPage, showProjectDetailsPage };