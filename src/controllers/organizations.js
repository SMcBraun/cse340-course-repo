/*
====================================================================
FILE: src/controllers/organizations.js
PURPOSE:
Acts as the coordinator (Controller) between the organizations and 
projects models and their corresponding EJS view templates.
====================================================================
*/

// ============================================================================
// MODEL IMPORTS
// ============================================================================

// PLAIN ENGLISH: Import database query functions for organizations.
// LOGIC: Imports getAllOrganizations and getOrganizationDetails from ../models/organizations.js.
// WHY WE NEED IT: Gives this controller access to fetch all organizations or look up a single organization by ID.
// LEARNING GAP: Controllers do not query databases directly; they delegate queries to the Model layer.
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';

// PLAIN ENGLISH: Import the query function that finds projects belonging to an organization.
// LOGIC: Imports getProjectsByOrganizationId from ../models/projects.js.
// WHY WE NEED IT: Needed so the detail view can display both the organization info and its associated service projects.
// LEARNING GAP: Demonstrates that a single controller can coordinate multiple models to fulfill one view requirement.
import { getProjectsByOrganizationId } from '../models/projects.js';
import { createOrganization } from '../models/organizations.js';

// ============================================================================
// CONTROLLER HANDLER FUNCTIONS
// ============================================================================

// PLAIN ENGLISH: The waiter function that handles the full list of organizations.
// LOGIC: An asynchronous controller function fetching all records and rendering organizations.ejs.
const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
};

// PLAIN ENGLISH: The waiter function that handles showing the details of one specific organization.
// LOGIC: Extracts route parameter :id from req.params, queries both models, and renders organization.ejs.
// WHY WE NEED IT: Manages the request lifecycle for dynamic URLs such as /organization/1 or /organization/12.
// LEARNING GAP: Using req.params captures values embedded directly in the URL path, matching route placeholders.
const showOrganizationDetailsPage = async (req, res) => {
    // PLAIN ENGLISH: Read the ID number that was passed in the browser URL path.
    // LOGIC: Extracts the 'id' property from the Express req.params object.
    const organizationId = req.params.id;

    // PLAIN ENGLISH: Fetch the organization's information using that ID.
    // LOGIC: Calls the organization model with the route parameter ID.
    const organizationDetails = await getOrganizationDetails(organizationId);

    // PLAIN ENGLISH: Fetch all the volunteer projects that belong to this organization.
    // LOGIC: Calls the project model using the same organization ID foreign key.
    const projects = await getProjectsByOrganizationId(organizationId);

    // PLAIN ENGLISH: Set the tab name for this detail page.
    // LOGIC: Defines string metadata for page title rendering.
    const title = 'Organization Details';

    // PLAIN ENGLISH: Send all the gathered data to the organization.ejs template to draw the screen.
    // LOGIC: Invokes res.render() compiling organization.ejs with title, organization details, and project list.
    res.render('organization', { title, organizationDetails, projects });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export both controller actions so routes.js can connect them to URLs.
// LOGIC: Named exports of both controller functions.
const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res) => {
    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png';

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);

    req.flash('success', 'Organization added successfully!');

    res.redirect(`/organization/${organizationId}`);
};

export { showOrganizationsPage, showOrganizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm };
