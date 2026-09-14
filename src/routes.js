/*
====================================================================
FILE: src/routes.js
====================================================================
*/

import express from 'express';
import { showHomePage } from './controllers/index.js';
// PLAIN ENGLISH: Import both organization actions from our controller.
import { showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { showProjectsPage } from './controllers/projects.js';
import { showCategoriesPage } from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);

// PLAIN ENGLISH: Listen for any URL that looks like /organization/ANY_ID and run the detail controller.
// LOGIC: Registers a GET route using the route parameter token ':id'.
// WHY WE NEED IT: Allows one route rule to dynamically match /organization/1, /organization/2, etc.
// LEARNING GAP: Route parameters (:paramName) capture path segments dynamically into req.params.
router.get('/organization/:id', showOrganizationDetailsPage);

router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

// Diagnostic Error Route
router.get('/test-error', testErrorPage);

export default router;