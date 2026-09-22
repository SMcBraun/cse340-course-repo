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
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
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

// PLAIN ENGLISH: Match /edit-organization/123 and show a form pre-filled with that organization current data.
// LOGIC: Registers a GET route using the parameter placeholder ':id'.
// WHY WE NEED IT: Lets users open an editable version of one specific organization record.
// LEARNING GAP: The same ':id' pattern used for viewing details is reused here for editing, just a different route.
router.get('/edit-organization/:id', showEditOrganizationForm);

// PLAIN ENGLISH: Match the form submission from the edit page and save the changes to the database.
// LOGIC: Registers a POST route, running organizationValidation first, then processEditOrganizationForm.
// WHY WE NEED IT: Applies the same validation and sanitization rules used for new organizations to edits.
// LEARNING GAP: Middleware order matters -- validation always runs before the controller that uses its results.
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);

// Service Project routes
router.get('/projects', showProjectsPage);
// PLAIN ENGLISH: Match any URL like /project/3 and display the details for that single project.
// LOGIC: Registers a GET route using the parameter placeholder ':id'.
// WHY WE NEED IT: Enables individual service project views using dynamic route parameters.
// LEARNING GAP: Semantic REST-like URL patterns (/project/:id) represent a singular resource entity.
router.get('/project/:id', showProjectDetailsPage);

// Category routes
router.get('/categories', categoriesController.showCategories);

// PLAIN ENGLISH: Match any URL like /category/1 and display all projects tagged with that category.
// LOGIC: Registers a dynamic GET route capturing the category primary key as :id.
// WHY WE NEED IT: Allows users to click on category links or tags and see filtered project lists.
// LEARNING GAP: Parameterized routing reuses a single controller function to serve distinct category views dynamically.
router.get('/category/:id', categoriesController.showCategoryDetails);

// Diagnostic test route
router.get('/test-error', testErrorPage);

export default router;
