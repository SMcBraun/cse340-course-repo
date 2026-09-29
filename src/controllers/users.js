/*
====================================================================
FILE: src/controllers/users.js
COURSE: CSE 340 - Web Backend Development (Week 5)
====================================================================
*/

// PLAIN ENGLISH: Bring in the bcrypt hashing tool.
// LOGIC: bcrypt was installed with "npm install bcrypt" (listed in package.json).
// WHY WE NEED IT: It scrambles the password before it is saved.
// LEARNING GAP: Hashing is one-way. Nobody, not even you, can turn the hash back
//               into the real password. Login will later use bcrypt.compare().
import bcrypt from 'bcrypt';

// PLAIN ENGLISH: Bring in the function that saves a user to the database.
// LOGIC: createUser lives in src/models/users.js and writes to the users table.
// WHY WE NEED IT: The controller handles the request; the model handles the SQL.
// LEARNING GAP: This is MVC. The controller never writes SQL itself.
import { createUser } from '../models/users.js';

// PLAIN ENGLISH: Show the registration form.
// LOGIC: Runs on GET /register. Renders src/views/register.ejs with a page title.
// WHY WE NEED IT: The person needs a form before they can sign up.
// LEARNING GAP: title is sent to the view, where <%= title %> displays it.
const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

// PLAIN ENGLISH: Handle the submitted form: hash the password, save the user.
// LOGIC: Runs on POST /register. Pulls name, email, password from req.body
//        (the form fields), hashes the password, calls createUser, then redirects.
// WHY WE NEED IT: This is where the new account is actually created.
// LEARNING GAP: The names in req.body come from the name="..." attributes in
//               register.ejs, so they must match exactly (name, email, password).
//               "async" + "await" makes the server wait for slow steps
//               (hashing, database) before moving on.
const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // PLAIN ENGLISH: Make a random "salt," then hash the password with it.
        // LOGIC: genSalt(10) = 10 salt rounds. hash() mixes salt + password.
        // WHY WE NEED IT: The salt makes the same password hash differently for
        //                 each person, so hackers can't use lookup tables.
        // LEARNING GAP: The salt is stored inside the hash itself (the part after
        //               $2b$10$), so bcrypt can still check a match at login.
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // PLAIN ENGLISH: Save the user with the hashed password.
        // LOGIC: Sends name, email, and the hash (never the real password) to the model.
        // WHY WE NEED IT: Stores the account in the users table.
        // LEARNING GAP: createUser returns the new user_id. It isn't used yet,
        //               but it's available for later features.
        const userId = await createUser(name, email, passwordHash);

        // PLAIN ENGLISH: Show a success message and send them to the home page.
        // LOGIC: req.flash saves a one-time message; redirect loads the home page.
        // WHY WE NEED IT: Tells the person registration worked.
        // LEARNING GAP: Redirecting after a POST stops the form from being
        //               submitted twice if the person refreshes the page.
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        // PLAIN ENGLISH: If anything failed, log it and send them back to the form.
        // LOGIC: Catches errors from hashing or the database (like a duplicate email).
        // WHY WE NEED IT: The site shows a friendly message instead of crashing.
        // LEARNING GAP: A duplicate email fails because of the UNIQUE rule on the
        //               email column (users_email_key). The details go to the
        //               terminal for you; the person only sees a general message.
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

// PLAIN ENGLISH: Share both functions so routes.js can use them.
// LOGIC: Named exports, imported in src/routes.js with the same names in { }.
// WHY WE NEED IT: Routes connect the /register URL to these functions.
// LEARNING GAP: Names must match exactly in the import, or the server won't start.
export { showUserRegistrationForm, processUserRegistrationForm };
