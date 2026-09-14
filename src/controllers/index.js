/*
====================================================================
FILE: src/controllers/index.js
PURPOSE:
Acts as the coordinator (Controller) for the home page. It handles 
incoming traffic to the root URL ('/') and renders the initial 
landing view.
====================================================================
*/

// ============================================================================
// MODEL IMPORTS
// ============================================================================
// PLAIN ENGLISH: No database models are needed here because the home page is static welcome content.
// LOGIC: Omitted import statements since no external data retrieval is required.
// WHY WE NEED IT: Demonstrates that not every controller action requires database access; some merely coordinate view rendering.
// LEARNING GAP: Controllers are flexible coordinators—they only call Models when dynamic data is actually required by the View.

// ============================================================================
// CONTROLLER HANDLER FUNCTIONS
// ============================================================================

// PLAIN ENGLISH: The waiter function that handles serving the home page.
// LOGIC: An asynchronous request handler function accepting Express req and res objects.
// WHY WE NEED IT: Provides the execution logic called by router.get('/') when visitors load the root website URL.
// LEARNING GAP: Standardizes handler naming conventions (e.g., showHomePage) to make code self-documenting.
const showHomePage = async (req, res) => {
    // PLAIN ENGLISH: Define the title that should appear on the browser tab for the home page.
    // LOGIC: Creates a string variable passed inside an options payload to the view engine.
    // WHY WE NEED IT: Allows the shared header partial to dynamically display 'Home' instead of a hardcoded title.
    // LEARNING GAP: Highlights how controllers inject contextual page metadata into reusable layout components.
    const title = 'Home';

    // PLAIN ENGLISH: Render the home.ejs template and pass it the page title.
    // LOGIC: Calls res.render() targeting src/views/home.ejs with a view context object.
    // WHY WE NEED IT: Compiles the EJS layout into browser-ready HTML and sends a 200 OK response back to the client.
    // LEARNING GAP: Directs response generation through the View layer rather than sending raw HTML strings directly from JavaScript.
    res.render('home', { title });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export this home page function so src/routes.js can import and use it.
// LOGIC: Uses ES Module named export syntax to expose showHomePage.
// WHY WE NEED IT: Makes this specific controller action accessible to our centralized routing file.
// LEARNING GAP: Adheres to modular architecture where route registration stays strictly separated from execution logic.
export { showHomePage };