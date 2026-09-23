/*
====================================================================
FILE: src/routes.js
PURPOSE:
Centralized route definitions mapping HTTP paths to controller actions.
====================================================================
*/

import express from 'express';
import { showHomePage } from './controllers/index.js';
import { showOrganizationsPage, showOrganizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm, showEditOrganizationForm, processEditOrganizationForm, organizationValidation } from './controllers/organizations.js';
import { showProjectsPage, showProjectDetailsPage, showNewProjectForm, processNewProjectForm, showEditProjectForm, processEditProjectForm, projectValidation } from './controllers/projects.js';
import categoriesController from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

// Home route
router.get('/', showHomePage);

// Organization routes
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);

// Service Project routes
router.get('/projects', showProjectsPage);
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);
router.get('/project/:id', showProjectDetailsPage);

// PLAIN ENGLISH: Match /edit-project/5 and show the edit form for project 5, already filled in.
// LOGIC: Registers a GET route capturing the project's ID as :id, handled by showEditProjectForm.
// WHY WE NEED IT: Gives users a web address to open when they want to change an existing project.
// LEARNING GAP: GET is for asking the server to SHOW something -- it never changes data in the database.
router.get('/edit-project/:id', showEditProjectForm);

// PLAIN ENGLISH: Match the edit form submission for project 5, check the data, and save the changes.
// LOGIC: Registers a POST route that runs projectValidation first, then processEditProjectForm.
// WHY WE NEED IT: Completes the edit-project workflow by sending the user's changes to the database.
// LEARNING GAP: We reuse projectValidation because the edit form has the same fields as the new-project form, so the same rules apply -- write once, use twice.
router.post('/edit-project/:id', projectValidation, processEditProjectForm);

// Category routes
router.get('/categories', categoriesController.showCategories);
router.get('/category/:id', categoriesController.showCategoryDetails);

// PLAIN ENGLISH: Match /assign-categories/5 and show a checkbox form for tagging project 5 with categories.
// LOGIC: Registers a GET route capturing the project's ID as :projectId.
// WHY WE NEED IT: Lets users open the category-assignment checklist for one specific project.
// LEARNING GAP: The parameter name here is :projectId instead of :id, since this route lives outside the /project path and needs to be explicit about which ID it expects.
router.get('/assign-categories/:projectId', categoriesController.showAssignCategoriesForm);

// PLAIN ENGLISH: Match the checkbox form submission and save the new full set of category tags for that project.
// LOGIC: Registers a POST route that calls processAssignCategoriesForm.
// WHY WE NEED IT: Completes the assign-categories workflow by writing the user's checkbox choices to the database.
// LEARNING GAP: No validation middleware runs here -- checkbox selections do not need text-length or format validation the way typed form fields do.
router.post('/assign-categories/:projectId', categoriesController.processAssignCategoriesForm);

// Diagnostic test route
router.get('/test-error', testErrorPage);

export default router;
