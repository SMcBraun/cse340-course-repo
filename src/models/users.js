/*
====================================================================
FILE: src/models/users.js
COURSE: CSE 340 - Web Backend Development (Week 5)
====================================================================
*/

// PLAIN ENGLISH: Bring in the database connection.
// LOGIC: db.js sets up the connection pool to PostgreSQL using DB_URL from .env.
// WHY WE NEED IT: Without it, this file can't send any SQL to the database.
// LEARNING GAP: Every model imports db the same way. The data comes from the
//               users and roles tables built in src/setup.sql.
import db from './db.js'

// PLAIN ENGLISH: Save a new user to the users table and give back their new ID.
// LOGIC: Receives name, email, and an already-hashed password from the controller.
//        The SQL inserts the row, looks up the role_id for the 'user' role,
//        and RETURNING hands back the new user_id.
// WHY WE NEED IT: The registration controller calls this to store the account.
// LEARNING GAP: This function never sees the real password, only the hash.
//               The part (SELECT role_id FROM roles WHERE role_name = $4) is a
//               "subquery": it finds the number for 'user' (which is 1) instead
//               of typing 1 directly. If the numbers ever change, this still works.
//               $1, $2, $3, $4 are placeholders filled in by queryParams, in order.
//               Placeholders keep typed text from being run as SQL (SQL injection).
const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4)) 
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, default_role];
    
    const result = await db.query(query, queryParams);

    // PLAIN ENGLISH: If nothing came back, the save failed, so raise an error.
    // LOGIC: result.rows holds what RETURNING sent back. Zero rows = no user saved.
    // WHY WE NEED IT: The controller's catch block uses this to show an error message.
    // LEARNING GAP: "throw" stops this function and passes the problem up to the
    //               controller, which decides what the person sees.
    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    // PLAIN ENGLISH: Print the new user's ID in the terminal, only if logging is on.
    // LOGIC: Checks the ENABLE_SQL_LOGGING setting in .env.
    // WHY WE NEED IT: Helps with testing without cluttering the terminal all the time.
    // LEARNING GAP: process.env values are always text, so we compare to 'true'
    //               in quotes, not the true/false value.
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

// PLAIN ENGLISH: Share createUser so other files can use it.
// LOGIC: Named export; the controller imports it with { createUser }.
// WHY WE NEED IT: src/controllers/users.js needs this function to save users.
// LEARNING GAP: The name in the curly braces must match exactly on both sides,
//               or the import fails (this caused an earlier Render deploy error).
export { createUser };
