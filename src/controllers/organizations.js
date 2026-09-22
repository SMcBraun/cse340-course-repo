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

import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// ============================================================================
// VALIDATION RULES
// ============================================================================

// PLAIN ENGLISH: Define the checklist of rules that organization form data must pass before it is trusted.
// LOGIC: An array of express-validator chains, each targeting one form field by name.
// WHY WE NEED IT: Shared by both the "new organization" and "edit organization" forms, since both need the same rules.
// LEARNING GAP: Storing validation rules as one reusable array avoids duplicating the same checks in two places.
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

// ============================================================================
// CONTROLLER HANDLER FUNCTIONS
// ============================================================================

const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';
    res.render('organization', { title, organizationDetails, projects });
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png';

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
};

// PLAIN ENGLISH: The waiter function that displays the edit form, pre-filled with an organization current data.
// LOGIC: Looks up the organization by its route ID, then renders edit-organization.ejs passing that data along.
// WHY WE NEED IT: Lets the user see and modify existing values instead of starting from a blank form.
// LEARNING GAP: Reuses the existing getOrganizationDetails model function instead of duplicating a lookup query.
const showEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);

    const title = 'Edit Organization';
    res.render('edit-organization', { title, organizationDetails });
};

// PLAIN ENGLISH: The waiter function that receives the edited form data and saves the changes.
// LOGIC: Validates the submission, then calls updateOrganization with the route ID and the new field values.
// WHY WE NEED IT: Completes the edit workflow by writing the user changes back to the database.
// LEARNING GAP: UPDATE routes need both the record ID (from the URL) and the new data (from the form body) together.
const processEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;

    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/edit-organization/' + organizationId);
    }

    const { name, description, contactEmail, logoFilename } = req.body;

    await updateOrganization(organizationId, name, description, contactEmail, logoFilename);

    req.flash('success', 'Organization updated successfully!');
    res.redirect(`/organization/${organizationId}`);
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
};
