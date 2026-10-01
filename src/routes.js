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

// PLAIN ENGLISH: Bring in the user functions from the user controller.
// LOGIC: Named imports from src/controllers/users.js; names match its export exactly.
//        Covers register, login, logout, the login lock (requireLogin), the dashboard
//        page, the admin users page (showUsersPage), and the admin lock factory (requireRole).
// WHY WE NEED IT: The /register, /login, /logout, /dashboard, /users, and admin-only routes below need these functions to run.
// LEARNING GAP: If a name here is misspelled, the server won't start at all.
//               showUsersPage was added in the W05 Assignment.
import { showUserRegistrationForm, processUserRegistrationForm, showLoginForm, processLoginForm, processLogout, requireLogin, showDashboard, showUsersPage, requireRole } from './controllers/users.js';

const router = express.Router();

// Home route
router.get('/', showHomePage);

// Organization routes

// PLAIN ENGLISH: Anyone can view the organizations list and each organization's details.
// LOGIC: These two GET routes have no lock, so logged-out visitors can see them too.
// WHY WE NEED IT: Viewing is public. Only adding and editing are limited to admins.
// LEARNING GAP: Authorization only goes on routes that CHANGE data (or show forms to change it).
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// PLAIN ENGLISH: Only admins can add or edit organizations.
// LOGIC: The admin lock runs first on each route. For the POST routes, validation runs
//        second, and the save function runs last.
// WHY WE NEED IT: Stops regular users (and logged-out visitors) from creating or changing organizations,
//                 even if they type the address directly.
// LEARNING GAP: Both the GET (show form) and the POST (save form) are locked. Locking only the GET
//               would leave the POST open to anyone who sends the form data directly.
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireRole('admin'), organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireRole('admin'), organizationValidation, processEditOrganizationForm);

// Service Project routes

// PLAIN ENGLISH: Anyone can view the projects list; only admins can open the new-project form or save it.
// LOGIC: /projects has no lock. The two /new-project routes run the admin lock first.
// WHY WE NEED IT: Keeps project creation limited to admins while browsing stays public.
// LEARNING GAP: The lock goes BEFORE projectValidation -- no point checking the form data of someone
//               who isn't allowed to submit it.
router.get('/projects', showProjectsPage);
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/project/:id', showProjectDetailsPage);

// PLAIN ENGLISH: Match /edit-project/5 and show the edit form for project 5, already filled in -- admins only.
// LOGIC: Registers a GET route capturing the project's ID as :id. The admin lock runs first, then showEditProjectForm.
// WHY WE NEED IT: Gives admins a web address to open when they want to change an existing project.
// LEARNING GAP: GET is for asking the server to SHOW something -- it never changes data in the database.
//               It's still locked, because the form itself is an admin tool.
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);

// PLAIN ENGLISH: Match the edit form submission for project 5, check the data, and save the changes -- admins only.
// LOGIC: Registers a POST route: the admin lock runs first, then projectValidation, then processEditProjectForm.
// WHY WE NEED IT: Completes the edit-project workflow by sending the admin's changes to the database.
// LEARNING GAP: We reuse projectValidation because the edit form has the same fields as the new-project form, so the same rules apply -- write once, use twice.
router.post('/edit-project/:id', requireRole('admin'), projectValidation, processEditProjectForm);

// Category routes
router.get('/categories', categoriesController.showCategories);
router.get('/category/:id', categoriesController.showCategoryDetails);

// PLAIN ENGLISH: When an admin opens the New Category page, the server shows the blank form.
// LOGIC: Registers a GET route: the admin lock runs first, then showNewCategoryForm.
// WHY WE NEED IT: Gives admins a web address where they can add a brand new category.
// LEARNING GAP: GET only SHOWS a page -- nothing is saved until the form is submitted with POST.
router.get('/new-category', requireRole('admin'), categoriesController.showNewCategoryForm);

// PLAIN ENGLISH: When the New Category form is submitted, the server checks the person is an admin, checks the name, then saves it.
// LOGIC: Registers a POST route: the admin lock first, then categoryValidation, then processNewCategoryForm.
// WHY WE NEED IT: Completes the create-category feature with server-side checking before anything reaches the database.
// LEARNING GAP: The order of items in a route matters, left to right: permission first, then data checks, then the save.
router.post('/new-category', requireRole('admin'), categoriesController.categoryValidation, categoriesController.processNewCategoryForm);

// PLAIN ENGLISH: When an admin opens the edit page for category 5, the server shows the form, already filled in.
// LOGIC: Registers a GET route capturing the category's ID as :id: the admin lock first, then showEditCategoryForm.
// WHY WE NEED IT: Gives admins a web address to open when they want to rename an existing category.
// LEARNING GAP: The :id part is a placeholder -- whatever number is in the address becomes req.params.id in the controller.
router.get('/edit-category/:id', requireRole('admin'), categoriesController.showEditCategoryForm);

// PLAIN ENGLISH: When the edit form for category 5 is submitted, the server checks the person is an admin, checks the name, then saves the change.
// LOGIC: Registers a POST route: the admin lock first, then categoryValidation, then processEditCategoryForm.
// WHY WE NEED IT: Completes the edit-category feature with server-side checking before the update reaches the database.
// LEARNING GAP: The same address as the GET route above -- the server tells them apart by the method (GET shows, POST saves).
router.post('/edit-category/:id', requireRole('admin'), categoriesController.categoryValidation, categoriesController.processEditCategoryForm);

// PLAIN ENGLISH: Match /assign-categories/5 and show a checkbox form for tagging project 5 with categories -- admins only.
// LOGIC: Registers a GET route capturing the project's ID as :projectId: the admin lock first, then the form.
// WHY WE NEED IT: Lets admins open the category-assignment checklist for one specific project.
// LEARNING GAP: The parameter name here is :projectId instead of :id, since this route lives outside the /project path and needs tobe explicit about which ID it expects.
router.get('/assign-categories/:projectId', requireRole('admin'), categoriesController.showAssignCategoriesForm);

// PLAIN ENGLISH: Match the checkbox form submission and save the new full set of category tags for that project -- admins only.
// LOGIC: Registers a POST route: the admin lock first, then processAssignCategoriesForm.
// WHY WE NEED IT: Completes the assign-categories workflow by writing the admin's checkbox choices to the database.
// LEARNING GAP: No validation middleware runs here -- checkbox selections do not need text-length or format validation the way typed form fields do.
//               The admin lock still runs, because permission and data-checking are two separate jobs.
router.post('/assign-categories/:projectId', requireRole('admin'), categoriesController.processAssignCategoriesForm);

// User registration routes

// PLAIN ENGLISH: When someone opens /register, the server shows the sign-up form.
// LOGIC: Registers a GET route handled by showUserRegistrationForm.
// WHY WE NEED IT: Gives new users a web address where they can create an account.
// LEARNING GAP: GET only SHOWS the form -- no account is created until the form is submitted with POST.
router.get('/register', showUserRegistrationForm);

// PLAIN ENGLISH: When the sign-up form is submitted, the server hashes the password and saves the new user.
// LOGIC: Registers a POST route handled by processUserRegistrationForm.
// WHY WE NEED IT: Completes the registration feature by storing the account in the users table.
// LEARNING GAP: Same address as the GET route above -- the server tells them apart by the method (GET shows, POST saves).
router.post('/register', processUserRegistrationForm);

// User login routes

// PLAIN ENGLISH: When someone opens /login, the server shows the login form.
// LOGIC: Registers a GET route handled by showLoginForm.
// WHY WE NEED IT: Gives users a web address where they can sign in.
// LEARNING GAP: GET only SHOWS the form -- the password isn't checked until the form is submitted with POST.
router.get('/login', showLoginForm);

// PLAIN ENGLISH: When the login form is submitted, the server checks the email and password and starts the session.
// LOGIC: Registers a POST route handled by processLoginForm.
// WHY WE NEED IT: This is where the server decides if the person is who they say they are (authentication).
// LEARNING GAP: Same address as the GET route above -- the server tells them apart by the method (GET shows, POST checks).
router.post('/login', processLoginForm);

// PLAIN ENGLISH: When someone clicks Logout, the server forgets who they are and sends them to the login page.
// LOGIC: Registers a GET route handled by processLogout.
// WHY WE NEED IT: Gives users a way to end their logged-in session.
// LEARNING GAP: This is a GET because it's triggered by clicking a plain link in the menu, not by submitting a form.
router.get('/logout', processLogout);

// Protected dashboard route

// PLAIN ENGLISH: When someone opens /dashboard, the server first checks if they are logged in.
//                Logged in = show the dashboard. Not logged in = send them to the login page.
// LOGIC: Registers a GET route with two functions in a row: requireLogin runs first, then showDashboard.
// WHY WE NEED IT: This is what actually protects the page. Typing /dashboard in the address bar still has to pass the lock.
// LEARNING GAP: Order matters, left to right. If showDashboard came first, the page would load before the check ever happened.
//               requireLogin only lets the request reach showDashboard by calling next().
//               The dashboard uses requireLogin (any logged-in user), not the admin lock (admins only).
router.get('/dashboard', requireLogin, showDashboard);

// Admin-only users page

// PLAIN ENGLISH: When someone opens /users, the server first checks if they are an admin.
//                Admin = show the list of all registered users.
//                Logged in but not an admin = send them to the dashboard with a "no permission" message.
//                Not logged in = send them to the login page.
// LOGIC: Registers a GET route with two functions in a row: requireRole('admin') runs first, then showUsersPage.
// WHY WE NEED IT: The W05 Assignment asks for a users page that only admins can open, even if
//                 someone types /users directly in the address bar.
// LEARNING GAP: This uses the admin lock, not requireLogin. requireRole already checks for login
//               first, so adding requireLogin too would just repeat the same check.
//               Compare with /dashboard just above: any logged-in user can see their own dashboard,
//               but only admins can see everyone's information.
router.get('/users', requireRole('admin'), showUsersPage);

// Diagnostic test route
router.get('/test-error', testErrorPage);

export default router;
