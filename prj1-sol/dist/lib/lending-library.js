import { Errors } from 'cs544-js-utils';
/************************ Main Implementation **************************/
export function makeLendingLibrary() {
    return new LendingLibrary();
}
export class LendingLibrary {
    //TODO: declare private TS properties for instance
    books;
    searchList;
    bookCheckouts;
    patronCheckouts;
    constructor() {
        //TODO: initialize private TS properties for instance
        this.books = {};
        this.searchList = {};
        this.bookCheckouts = {};
        this.patronCheckouts = {};
    }
    /** Add one-or-more copies of book represented by req to this library.
     *
     *  Errors:
     *    MISSING: one-or-more of the required fields is missing.
     *    BAD_TYPE: one-or-more fields have the incorrect type.
     *    BAD_REQ: other issues like nCopies not a positive integer
     *             or book is already in library but data in obj is
     *             inconsistent with the data already present.
     */
    addBook(req) {
        //TODO
        const validationRes = addBookValidation(req);
        if (!validationRes.isOk)
            return validationRes;
        return Errors.errResult('TODO'); //placeholder
    }
    /** Return all books matching (case-insensitive) all "words" in
     *  req.search, where a "word" is a max sequence of /\w/ of length > 1.
     *  Returned books should be sorted in ascending order by title.
     *
     *  Errors:
     *    MISSING: search field is missing
     *    BAD_TYPE: search field is not a string.
     *    BAD_REQ: no words in search
     */
    findBooks(req) {
        //TODO
        return Errors.errResult('TODO'); //placeholder
    }
    /** Set up patron req.patronId to check out book req.isbn.
     *
     *  Errors:
     *    MISSING: patronId or isbn field is missing
     *    BAD_TYPE: patronId or isbn field is not a string.
     *    BAD_REQ error on business rule violation.
     */
    checkoutBook(req) {
        //TODO
        return Errors.errResult('TODO'); //placeholder
    }
    /** Set up patron req.patronId to returns book req.isbn.
     *
     *  Errors:
     *    MISSING: patronId or isbn field is missing
     *    BAD_TYPE: patronId or isbn field is not a string.
     *    BAD_REQ error on business rule violation.
     */
    returnBook(req) {
        //TODO 
        return Errors.errResult('TODO'); //placeholder
    }
}
/********************** Domain Utility Functions ***********************/
//TODO: add domain-specific utility functions or classes.
/** Validate input for function addBook()
 *
 * Errors:
 *    MISSING: one-or-more of the required fields is missing.
 *    BAD_TYPE: one-or-more fields have the incorrect type.
 *    BAD_REQ: other issues like nCopies not a positive integer
 *             or book is already in library but data in obj is
 *             inconsistent with the data already present.
 */
function addBookValidation(req) {
    //Check for missing fields
    if (!req.hasOwnProperty("isbn") ||
        !req.hasOwnProperty("title") ||
        !req.hasOwnProperty("pages") ||
        !req.hasOwnProperty("year") ||
        !req.hasOwnProperty("authors") ||
        !req.hasOwnProperty("publisher")) {
        return Errors.errResult("MISSING");
    }
    //Type checking
    if (typeof req.isbn === "string" &&
        typeof req.title === "string" &&
        req.authors instanceof Array &&
        req.authors.every(author => typeof author === "string") &&
        typeof req.pages === "number" &&
        typeof req.year === "number" &&
        typeof req.publisher === "string") {
        if (req.nCopies <= 0 || typeof req.nCopies !== "number")
            return Errors.errResult("BAD_REQ");
        //Bad input checking
        return Errors.okResult("OK");
    }
    return Errors.errResult("TODO");
}
/********************* General Utility Functions ***********************/
//TODO: add general utility functions or classes.
//# sourceMappingURL=lending-library.js.map