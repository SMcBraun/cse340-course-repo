/*
====================================================================
FILE: src/routes.js
PURPOSE:
Centralized route definitions mapping HTTP paths to controller actions.
====================================================================
*/

import express from 'express';
import { showHomePage } from './controllers/index.js';
import { showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { showCategoriesPage } from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

// Home route
router.get('/', showHomePage);

// Organization routes
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// Service Project routes
router.get('/projects', showProjectsPage);
// PLAIN ENGLISH: Match any URL like /project/3 and display the details for that single project.
// LOGIC: Registers a GET route using the parameter placeholder ':id'.
// WHY WE NEED IT: Enables individual service project views using dynamic route parameters.
// LEARNING GAP: Semantic REST-like URL patterns (/project/:id) represent a singular resource entity.
router.get('/project/:id', showProjectDetailsPage);

// Category routes
router.get('/categories', showCategoriesPage);

// Diagnostic test route
router.get('/test-error', testErrorPage);

export default router;