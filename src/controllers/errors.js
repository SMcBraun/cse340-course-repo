/*
====================================================================
FILE: src/controllers/errors.js
PURPOSE:
Acts as a diagnostic and error simulation controller. It provides 
endpoints designed to intentionally trigger error conditions to verify 
our centralized error-handling middleware.
====================================================================
*/

// ============================================================================
// MODEL IMPORTS
// ============================================================================
// PLAIN ENGLISH: No database models are required for simulating or dispatching test errors.
// LOGIC: Omitted import statements due to lack of external data requirements.
// WHY WE NEED IT: Diagnostic handlers focus entirely on pipeline flow rather than persistent storage.
// LEARNING GAP: Confirms that error testing mechanisms can be evaluated independently of database availability.

// ============================================================================
// CONTROLLER HANDLER FUNCTIONS
// ============================================================================

// PLAIN ENGLISH: A test function that deliberately crashes with a 500 error to test our safety net.
// LOGIC: Synchronous route handler accepting req, res, and the Express next middleware function.
// WHY WE NEED IT: Allows developers and graders to trigger an intentional 500 Internal Server Error on command.
// LEARNING GAP: Illustrates that error-triggering routes require access to next() to manually forward an error down the pipeline.
const testErrorPage = (req, res, next) => {
    // PLAIN ENGLISH: Construct a brand-new error message explaining that this is a simulated drill.
    // LOGIC: Instantiates a standard JavaScript Error object with a custom string message.
    // WHY WE NEED IT: Provides descriptive error metadata that our logger and development error box can display.
    // LEARNING GAP: Standard Error objects automatically capture the execution stack trace at the exact moment of instantiation.
    const err = new Error('This is a test error');

    // PLAIN ENGLISH: Tag this error with the 500 status code indicating an internal server failure.
    // LOGIC: Attaches a custom numeric property 'status' directly onto the Error object instance.
    // WHY WE NEED IT: Informs the downstream global error middleware which HTTP status code to assign to the response.
    // LEARNING GAP: Demonstrates expanding standard error objects with HTTP-specific status codes to control middleware behavior.
    err.status = 500;

    // PLAIN ENGLISH: Send this error down the assembly line straight to our global error-handling safety net.
    // LOGIC: Calls next() with an argument: next(err).
    // WHY WE NEED IT: Express skips all regular routes and jumps directly to 4-parameter error middleware when next() receives an argument.
    // LEARNING GAP: Differentiates next() (proceed to next regular middleware) from next(err) (abort pipeline and jump to error handlers).
    next(err);
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// PLAIN ENGLISH: Export this diagnostic error function so src/routes.js can map it to '/test-error'.
// LOGIC: Exports testErrorPage as a named ES Module export.
// WHY WE NEED IT: Integrates the error testing endpoint into our centralized routing table.
// LEARNING GAP: Keeps intentional testing utilities isolated in a distinct module rather than mixing them with production controllers.
export { testErrorPage };