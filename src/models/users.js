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

// PLAIN ENGLISH: Bring in the bcrypt tool so this file can check passwords.
// LOGIC: bcrypt.compare() is used in verifyPassword below.
// WHY WE NEED IT: Login must check a typed password against the stored hash.
// LEARNING GAP: Registration used bcrypt.hash() in the controller. Login uses
//               bcrypt.compare() here in the model. Same tool, two jobs.
import bcrypt from 'bcrypt';

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

// PLAIN ENGLISH: Look up one user by their email address, including their role name.
// LOGIC: Joins the users table (nicknamed u) to the roles table (nicknamed r),
//        matching each user's role_id to the roles row with the same role_id.
//        Returns user_id, name, email, password_hash, and role_name
//        ('user' or 'admin'), or null if no one has that email.
// WHY WE NEED IT: Login starts by finding who is trying to log in. The role name
//                 rides along into the session, so requireRole can check it later
//                 without asking the database again.
// LEARNING GAP: Changed in W05 Admin Role. Before, this returned role_id (a number
//               like 2). Now it returns role_name (a word like 'admin'), which is
//               easier to read and check. The assignment's sample query leaves out
//               name, but we keep it so the dashboard can still show the name.
//               u and r are short nicknames (aliases) so we don't have to type
//               users. and roles. in front of every column.
//               This DOES pull password_hash, because the next step needs it
//               to check the password. It gets removed before the user is
//               sent anywhere else (see authenticateUser).
//               Not exported: only authenticateUser uses it, inside this file.
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];
    
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

// PLAIN ENGLISH: Check if a typed password matches the stored hash.
// LOGIC: bcrypt.compare() hashes the typed password using the salt saved inside
//        the stored hash, then checks if the two hashes match. Returns true/false.
// WHY WE NEED IT: The hash can't be un-scrambled, so we compare instead.
// LEARNING GAP: We never turn the hash back into a password. We scramble the
//               new attempt the same way and see if it lands on the same result.
//               Not exported: only authenticateUser uses it, inside this file.
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

// PLAIN ENGLISH: The full login check: find the user, check the password,
//                and hand back the user (without the password hash) if it's correct.
// LOGIC: 1) findUserByEmail. No user -> null.
//        2) verifyPassword. Wrong password -> null.
//        3) Correct -> delete password_hash from the object, return the user.
// WHY WE NEED IT: This is the one function the login controller calls.
// LEARNING GAP: Both failures return the same null on purpose, so the controller
//               can't tell (and can't reveal) whether the email or the password
//               was wrong. That keeps hackers from learning which emails exist.
//               "delete" removes the hash so it never ends up in the session.
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null;
    }

    const isPasswordCorrect = await verifyPassword(password, user.password_hash);

    if (!isPasswordCorrect) {
        return null;
    }

    delete user.password_hash;
    return user;
};

// PLAIN ENGLISH: Share only the functions the controller needs.
// LOGIC: Named exports; the controller imports them with { createUser, authenticateUser }.
// WHY WE NEED IT: src/controllers/users.js uses createUser (register) and
//                 authenticateUser (login).
// LEARNING GAP: findUserByEmail and verifyPassword stay private to this file,
//               as the assignment asks. The name in the curly braces must match
//               exactly on both sides, or the import fails.
export { createUser, authenticateUser };
