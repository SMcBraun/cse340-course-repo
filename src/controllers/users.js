/*
====================================================================
FILE: src/controllers/users.js
COURSE: CSE 340 - Web Backend Development (Week 5)
====================================================================
*/

// PLAIN ENGLISH: Bring in the bcrypt hashing tool.
// LOGIC: bcrypt was installed with "npm install bcrypt" (listed in package.json).
// WHY WE NEED IT: It scrambles the password before it is saved at registration.
// LEARNING GAP: Hashing is one-way. Nobody, not even you, can turn the hash back
//               into the real password. Login checks passwords in the model
//               with bcrypt.compare().
import bcrypt from 'bcrypt';

// PLAIN ENGLISH: Bring in the model functions that save and check users.
// LOGIC: createUser (register) and authenticateUser (login) live in
//        src/models/users.js and read/write the users table.
// WHY WE NEED IT: The controller handles the request; the model handles the SQL.
// LEARNING GAP: This is MVC. The controller never writes SQL itself.
import { createUser, authenticateUser } from '../models/users.js';

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

// PLAIN ENGLISH: Show the login form.
// LOGIC: Runs on GET /login. Renders src/views/login.ejs with a page title.
// WHY WE NEED IT: The person needs a form to type their email and password.
// LEARNING GAP: Showing a page never changes data, so this doesn't need async.
const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

// PLAIN ENGLISH: Handle the submitted login form: check the email and password,
//                and if correct, remember the person in the session.
// LOGIC: Runs on POST /login. Calls authenticateUser. A user object back = success:
//        save it to req.session.user, flash success, go home.
//        null back = failure: flash an error, go back to the login page.
// WHY WE NEED IT: This is the moment a visitor becomes a logged-in user.
// LEARNING GAP: req.session.user is the "wristband." Every later request carries
//               the session cookie, so the server knows who this is without
//               asking for the password again. The user object has NO
//               password_hash (the model removed it).
//               The error says "email or password" on purpose, so it never
//               reveals which one was wrong.
const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            // PLAIN ENGLISH: Print the logged-in user in the terminal while developing.
            // LOGIC: Only runs when res.locals.NODE_ENV is 'development'.
            // WHY WE NEED IT: Lets you confirm what was saved to the session.
            // LEARNING GAP: This never prints on the live site (production),
            //               so user info doesn't clutter Render's logs.
            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        // PLAIN ENGLISH: If something broke (like the database), show a friendly error.
        // LOGIC: Logs details to the terminal, sends the person back to the login page.
        // WHY WE NEED IT: A crash would show a scary error page instead.
        // LEARNING GAP: A wrong password is NOT an error here. That's handled by the
        //               "else" above. catch is only for unexpected problems.
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

// PLAIN ENGLISH: Log the person out and send them to the login page.
// LOGIC: Runs on GET /logout. Removes user from the session, flashes a message,
//        redirects to /login.
// WHY WE NEED IT: People need a way to end their logged-in session.
// LEARNING GAP: We delete only req.session.user instead of destroying the whole
//               session. Flash messages are stored in the session, so destroying
//               it would also erase the "Logout successful!" message.
const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

// PLAIN ENGLISH: Share all five functions so routes.js can use them.
// LOGIC: Named exports, imported in src/routes.js with the same names in { }.
// WHY WE NEED IT: Routes connect /register, /login, and /logout to these functions.
// LEARNING GAP: Names must match exactly in the import, or the server won't start.
export { showUserRegistrationForm, processUserRegistrationForm, showLoginForm, processLoginForm, processLogout };
