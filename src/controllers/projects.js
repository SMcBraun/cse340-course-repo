/*
====================================================================
FILE: src/controllers/projects.js
PURPOSE:
Coordinates data flow between the Project model and the project views.
====================================================================
*/

import {
    getUpcomingProjects,
    getProjectDetails,
    getCategoriesByProjectId,
    createProject
} from '../models/projects.js';

// PLAIN ENGLISH: Import the organizations lookup so the new project form can offer a dropdown of choices.
// LOGIC: Imports getAllOrganizations from the organizations model.
// WHY WE NEED IT: Every project belongs to an organization, so the form needs the full list to let the user pick one.
// LEARNING GAP: A controller can pull from more than one model when a view needs data from two related tables.
import { getAllOrganizations } from '../models/organizations.js';

import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// ============================================================================
// VALIDATION RULES
// ============================================================================

// PLAIN ENGLISH: Define the checklist of rules that new project form data must pass before it is trusted.
// LOGIC: An array of express-validator chains, each targeting one form field by name.
// WHY WE NEED IT: Ensures a project can never be saved with missing text, an invalid date, or a corrupted organization link.
// LEARNING GAP: isISO8601() and isInt() validate format, not just presence -- a field can be non-empty and still be the wrong shape.
const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error(`Project with ID ${projectId} not found`);
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesByProjectId(projectId);

        const title = project.title;
        res.render('project', { title, project, categories });
    } catch (error) {
        next(error);
    }
};

// PLAIN ENGLISH: The waiter function that displays the blank new project form, including the organization dropdown.
// LOGIC: Fetches every organization from the database, then renders new-project.ejs passing that list along.
// WHY WE NEED IT: The dropdown menu cannot exist without a full list of organizations to populate its options.
// LEARNING GAP: The controller gathers everything a view needs into one data object before calling res.render().
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        res.render('new-project', { title, organizations });
    } catch (error) {
        next(error);
    }
};

// PLAIN ENGLISH: The waiter function that receives the new project form data, validates it, and saves it.
// LOGIC: Checks validationResult() first; on failure, flashes each error and redirects back to the form. On success, calls createProject and redirects to the new project's details page.
// WHY WE NEED IT: Completes the create-project workflow, the same pattern already used for organizations.
// LEARNING GAP: A try/catch around the database call lets us flash a friendly error message instead of crashing if the insert fails unexpectedly.
const processNewProjectForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;

    try {
        const newProjectId = await createProject(title, description, location, date, organizationId);

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    projectValidation
};
