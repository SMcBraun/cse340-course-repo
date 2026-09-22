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

// PLAIN ENGLISH: Match /new-project and show a blank form, with a dropdown listing every organization.
// LOGIC: Registers a GET route that calls showNewProjectForm.
// WHY WE NEED IT: Lets users start creating a brand new service project record.
// LEARNING GAP: This route must be registered before /project/:id, or Express could mistake "new-project" for an ID value.
router.get('/new-project', showNewProjectForm);

// PLAIN ENGLISH: Match the form submission from the new project page, validate it, then save it.
// LOGIC: Registers a POST route running projectValidation first, then processNewProjectForm.
// WHY WE NEED IT: Applies the same validate-then-process pattern already used for organizations.
// LEARNING GAP: Reusing this pattern across different resources (organizations, projects) shows how the same architecture scales to new features.
router.post('/new-project', projectValidation, processNewProjectForm);

router.get('/project/:id', showProjectDetailsPage);

// Category routes
router.get('/categories', categoriesController.showCategories);
router.get('/category/:id', categoriesController.showCategoryDetails);

// Diagnostic test route
router.get('/test-error', testErrorPage);

export default router;
