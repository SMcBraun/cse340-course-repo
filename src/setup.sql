/*
====================================================================
FILE: src/setup.sql
COURSE: CSE 340 - Web Backend Development
====================================================================
*/

-- =================================================================
-- STEP 0: Clean up old tables to avoid duplicate entries & key conflicts
-- =================================================================
-- PLAIN ENGLISH: Delete old tables (if they exist) so we can rebuild fresh.
-- LOGIC: users drops before roles, and project_category before project,
--        because a table that points to another must be removed first.
-- WHY WE NEED IT: Lets this file run again without "already exists" errors.
-- LEARNING GAP: CASCADE also removes anything that depends on the table.
--               IF EXISTS means "skip quietly if the table isn't there."
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.project_category CASCADE;
DROP TABLE IF EXISTS public.project CASCADE;
DROP TABLE IF EXISTS public.category CASCADE;
DROP TABLE IF EXISTS public.organization CASCADE;

-- =================================================================
-- STEP 1: Build the "organization" table
-- =================================================================
CREATE TABLE IF NOT EXISTS public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- =================================================================
-- STEP 2: Fill the table with organizations
-- =================================================================
INSERT INTO public.organization (name, description, contact_email, logo_filename)
VALUES
(
    'BrightFuture Builders',
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
    'info@brightfuturebuilders.org',
    'brightfuture-logo.png'
),
(
    'GreenHarvest Growers',
    'An urban farming collective promoting food sustainability and education in local neighborhoods.',
    'contact@greenharvest.org',
    'greenharvest-logo.png'
),
(
    'UnityServe Volunteers',
    'A volunteer coordination group supporting local charities and service initiatives.',
    'hello@unityserve.org',
    'unityserve-logo.png'
);

-- ====================================================================
-- STEP 3: Build the "project" table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES public.organization(organization_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    project_date DATE NOT NULL
);

-- ====================================================================
-- STEP 4: Insert sample projects
-- ====================================================================
INSERT INTO public.project (organization_id, title, description, location, project_date) VALUES
(1, 'Community Center Renovation', 'Help renovate the local community youth hall.', 'Downtown Community Center', '2026-10-05'),
(1, 'Ramp Construction', 'Build accessibility ramps for elderly residents.', 'Maple Street 402', '2026-10-12'),
(1, 'Shelter Roof Repair', 'Replace leaking tiles on the emergency shelter.', 'Hope Shelter', '2026-10-19'),
(1, 'Playground Assembly', 'Assemble new swing sets at Riverside Park.', 'Riverside Park', '2026-10-26'),
(1, 'Housing Painting', 'Paint fresh interior coats in transitional housing units.', 'Pinecrest Ave', '2026-11-02'),

(2, 'Community Garden Planting', 'Plant fall vegetables in the neighborhood lot.', 'Green District Garden', '2026-10-03'),
(2, 'Tree Planting Day', 'Plant 50 saplings across neighborhood sidewalks.', 'Oak & 5th Ave', '2026-10-10'),
(2, 'Greenhouse Winterization', 'Install plastic insulating layers in community greenhouses.', 'Urban Farm Lot B', '2026-10-17'),
(2, 'Compost Workshop Prep', 'Turn compost piles and set up demonstration bins.', 'Fairgrounds', '2026-10-24'),
(2, 'Seed Harvesting', 'Harvest and package heirloom seeds for spring planting.', 'Civic Pavilion', '2026-11-07'),

(3, 'Senior Food Delivery', 'Package and deliver groceries to homebound seniors.', 'Unity Kitchen', '2026-10-04'),
(3, 'After-School Homework Help', 'Tutor middle school students in math and reading.', 'Lincoln Library', '2026-10-11'),
(3, 'Winter Coat Drive Sorting', 'Sort, fold, and box donated winter apparel.', 'East District Depot', '2026-10-18'),
(3, 'Soup Kitchen Meal Service', 'Prep, cook, and serve evening warm meals.', 'St. Jude Hall', '2026-10-25'),
(3, 'Hygiene Kit Assembly', 'Assemble essential care packages for distribution.', 'Civic Center Rm 101', '2026-11-01');

-- ====================================================================
-- STEP 5: Build "category" & "project_category" join tables
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_category (
    project_id INTEGER NOT NULL REFERENCES public.project(project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES public.category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- ====================================================================
-- STEP 6: Insert categories & associations
-- ====================================================================
INSERT INTO public.category (name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

INSERT INTO public.project_category (project_id, category_id) VALUES
(1, 3), (2, 3), (3, 3), (4, 3), (5, 3),
(6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
(11, 4), (12, 2), (13, 3), (14, 4), (15, 4);

-- ====================================================================
-- STEP 7: Build the "roles" table and add the starting roles (Week 5)
-- ====================================================================
-- PLAIN ENGLISH: A list of the types of users the site allows.
-- LOGIC: role_id numbers itself (1, 2...). role_name must be filled in
--        and can't repeat. role_description is an optional longer note.
-- WHY WE NEED IT: Authorization. The role decides what a logged-in
--                 person is allowed to do (e.g., only admins can edit).
-- LEARNING GAP: We skip role_id in the INSERT because SERIAL fills it in.
--               Result: 1 = user, 2 = admin. The users table uses these numbers.
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT
);

INSERT INTO roles (role_name, role_description) VALUES 
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access');

-- ====================================================================
-- STEP 8: Build the "users" table (Week 5)
-- ====================================================================
-- PLAIN ENGLISH: Stores each person who has an account on the site.
-- LOGIC: email is the login name (required, no duplicates).
--        role_id points to a row in roles. created_at fills in automatically.
-- WHY WE NEED IT: Authentication. The site checks this table to confirm
--                 who someone is when they log in.
-- LEARNING GAP: password_hash stores a scrambled password, never the real one.
--               REFERENCES roles(role_id) is the foreign key: the database
--               rejects any role_id that doesn't exist in roles. roles must
--               be built first, the same way organization comes before project.
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
