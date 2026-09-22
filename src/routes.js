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
import { showProjectsPage, showProjectDetailsPage, showNewProjectForm, processNewProjectForm, projectValidation } from './controllers/projects.js';
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
