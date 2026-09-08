// ============================================================================
// FILE: src/models/categories.js
// WHAT THIS FILE DOES: 
// This file acts as our "fetcher." Its only job is to talk directly to the 
// database, ask for the list of categories, and bring them back to the app.
// ============================================================================

// 1. BRING IN THE DATABASE CONNECTION
// PLAIN ENGLISH: Grab our database query pool from db.js using modern ES Module import.
// WHY WE NEED IT: Instead of opening a new database connection every time, we reuse the shared pool to stay fast.
import db from './db.js';

// 2. DEFINE THE FUNCTION TO GET ALL CATEGORIES
// PLAIN ENGLISH: This is our recipe to fetch the category list. 
// WHY "async": Getting data across the internet takes time. "async" tells our app, 
// "Hey, pause here and wait for the database to reply—do not rush ahead with empty hands."
async function getAllCategories() {

    // 3. WRITE OUT OUR REQUEST IN DATABASE LANGUAGE (SQL)
    // PLAIN ENGLISH: "Go to the categories table, get every item, and sort them A to Z."
    // WHY WE DO IT THIS WAY: Databases are built to sort items instantly. Asking the database 
    // to alphabetize them is much faster and cleaner than writing sorting code in JavaScript.
    const query = 'SELECT * FROM category ORDER BY name ASC;';

    // 4. SEND THE REQUEST AND WAIT FOR THE ANSWER
    // PLAIN ENGLISH: Run the SQL command through our database doorway and wait for the result.
    // WHY "await": Without "await", JavaScript would jump to the next line immediately before 
    // the database even had a chance to look up the records.
    const result = await db.query(query);

    // 5. HAND OVER ONLY THE ACTUAL LIST OF DATA
    // PLAIN ENGLISH: The database gives back metadata we don't need; "result.rows" holds the real records.
    // WHY WE DO IT: Our web page only needs the list of category rows to display on screen.
    return result.rows;
}

// 6. SHARE THIS RECIPE WITH THE REST OF OUR APP
// PLAIN ENGLISH: Put this function in the shared toolbox so server.js can use it.
// WHY "export": This allows other files using modern JavaScript (ES Modules) to import and run this function.
export { getAllCategories };

