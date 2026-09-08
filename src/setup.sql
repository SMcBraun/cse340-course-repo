/*
====================================================================
FILE: src/setup.sql
COURSE: CSE 340 - Web Backend Development
ACTIVITY: Creating the Organizations Table & Adding Starter Info

WHY WE NEED THIS FILE:
Our free online database automatically erases itself every 30 days. 
Think of this file as a complete backup recipe. If our database ever 
gets wiped clean, running this file will instantly rebuild our table 
and restore all of our starter information in seconds.

BIG IDEAS TO REMEMBER:
1. Blueprint: First, we set up an empty table and decide what kind of 
   information goes into each column.
2. Rules: We set strict rules so important boxes can't be left blank.
3. Starter Info: Once the empty table exists, we fill it with our 
   first 3 sample organizations.
4. Smart Storage: Websites run faster when databases only store the 
   *file name* of a picture (like "logo.png"), while the actual heavy 
   image file sits in our regular project folders.
====================================================================
*/

-- =================================================================
-- STEP 1: Build the empty "organization" table
-- =================================================================
-- Think of this like creating an empty spreadsheet with labeled columns.

CREATE TABLE IF NOT EXISTS organization (
    -- organization_id: A unique tracking number for each group. 
    -- The computer assigns 1, 2, 3... automatically, so we never have to type it.
    organization_id SERIAL PRIMARY KEY,

    -- name: The organization's name. It cannot be left empty, and it maxes out at 150 letters.
    name VARCHAR(150) NOT NULL,

    -- description: A detailed summary. We use TEXT so it can be as long as needed with no limit.
    description TEXT NOT NULL,

    -- contact_email: The group's email address. It cannot be left blank.
    contact_email VARCHAR(255) NOT NULL,

    -- logo_filename: The name of the picture file. We store the label here, not the heavy picture itself.
    logo_filename VARCHAR(255) NOT NULL
);

-- =================================================================
-- STEP 2: Fill the table with our first 3 organizations
-- =================================================================
-- Notice we do not type an ID number here; the computer creates the ID numbers for us.

INSERT INTO organization (name, description, contact_email, logo_filename)
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