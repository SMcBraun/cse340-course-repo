/*
====================================================================
FILE: run-setup.js
PURPOSE:
A dedicated runner script that takes raw SQL commands written in 
`src/setup.sql` and transmits them directly over the network to our 
PostgreSQL database server.

LEARNING GAP / RATIONALE:
Simply writing SQL into a `.sql` file only saves text to our local 
hard drive. PostgreSQL knows nothing about those tables until an active 
database client actually reads the file and executes the commands. 
Because our project lacks a pre-configured `npm run setup` script, 
this utility bridges that gap using our existing Node.js database pool.

VALUE:
Allows reproducible database recreation. Anytime you modify your 
database schema or wipe your database, running this single command 
completely restores all tables, constraints, and sample data.
====================================================================
*/

// LOGIC: Import the native Node.js File System module.
// PURPOSE: Enables our program to read and parse local files on disk.
// VALUE: Lets us keep pure SQL in `setup.sql` rather than hardcoding SQL strings in JavaScript.
import fs from 'fs';

// LOGIC: Import the native Node.js Path utility module.
// PURPOSE: Safely builds absolute filesystem paths across different operating systems (Mac, Windows, Linux).
// VALUE: Prevents broken file paths regardless of which folder terminal commands are run from.
import path from 'path';

// LOGIC: Import our existing database connection pool object.
// PURPOSE: Reuses our secure PostgreSQL credentials configured in `.env`.
// VALUE: Avoids duplicating database connection settings or exposing credentials in multiple files.
import db from './src/models/db.js';

// FUNCTION: executeSetupSQL
// PURPOSE: Asynchronously loads the SQL file, sends it to PostgreSQL, and logs status messages.
const executeSetupSQL = async () => {
    try {
        // LOGIC: Construct the absolute operating system path pointing directly to `src/setup.sql`.
        // PURPOSE: Guarantees the script finds the file without relative folder confusion.
        const sqlFilePath = path.join(process.cwd(), 'src', 'setup.sql');

        // LOGIC: Read the entire text contents of `setup.sql` using standard UTF-8 text encoding.
        // PURPOSE: Converts the raw file bytes into an executable JavaScript text string.
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // LOGIC: Notify the developer in the terminal that the operation has started.
        // VALUE: Provides immediate feedback so you know the script is actively working.
        console.log('Reading src/setup.sql and sending queries to the database...');

        // LOGIC: Transmit the entire multi-statement SQL script to PostgreSQL and await execution.
        // PURPOSE: Creates all tables (project, category, project_category) and inserts all sample rows.
        await db.query(sql);

        // LOGIC: Provide a success confirmation message in the terminal.
        console.log('Database tables and sample data successfully created!');

        // LOGIC: Gracefully terminate the Node.js process with exit code 0 (success).
        // VALUE: Closes the process so your terminal prompt returns immediately.
        process.exit(0);

    } catch (error) {
        // LOGIC: Catch and print any syntax errors, constraint violations, or connection dropouts.
        // VALUE: Pinpoints the exact SQL line or database issue if something fails.
        console.error('Error executing setup.sql:', error);

        // LOGIC: Forcefully exit the process with code 1 to indicate a failure occurred.
        process.exit(1);
    }
};

// LOGIC: Invoke the function immediately upon executing the script.
executeSetupSQL();