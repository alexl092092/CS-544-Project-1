import { Errors } from 'cs544-js-utils';
/************************ Main Implementation **************************/
export function makeLendingLibrary() {
    return new LendingLibrary();
}
export class LendingLibrary {
    //TODO: declare private TS properties for instance
    books;
    searchList;
    bookCheckouts; //Keep track of which patrons have checked out a book
    patronCheckouts; //Keep track of which books have been checked out by a patron
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
        //Validation
        const validationRes = addBookValidation(req, this.books);
        if (!validationRes.isOk)
            return validationRes;
        //Adding book to library
        const bookISBN = req.isbn;
        //Convert req into XBook
        let book = {
            isbn: req.isbn,
            title: req.title,
            authors: req.authors,
            pages: req.pages,
            year: req.year,
            publisher: req.publisher,
            nCopies: req.nCopies ?? 1,
        };
        //Updating book list
        if (bookISBN in this.books) {
            this.books[bookISBN].nCopies += book.nCopies;
            book = this.books[bookISBN];
        }
        else {
            this.books[bookISBN] = book;
            //Updating book index list if new book
            updateSearchList(book, this.searchList);
        }
        return Errors.okResult(book);
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
     *
     *
        private bookCheckouts: Record<ISBN, PatronId[]>;    //Keep track of which patrons have checked out a book
        private patronCheckouts: Record<PatronId, ISBN[]>;  //Keep track of which books have been checked out by a patron
     */
    checkoutBook(req) {
        //Validation
        const validationRes = checkoutBookValidation(req, this.books);
        if (!validationRes.isOk)
            return validationRes;
        const patronId = req.patronId;
        const isbn = req.isbn;
        //Initialize checkout arrays if uninitialized
        if (!this.patronCheckouts[patronId])
            this.patronCheckouts[patronId] = [];
        if (!this.bookCheckouts[isbn])
            this.bookCheckouts[isbn] = [];
        //Check if patron has already checked out this book
        if (this.patronCheckouts[patronId].includes(isbn)) {
            return Errors.errResult(`patron ${patronId} already has book ${isbn} checked out`, "BAD_REQ", "isbn");
        }
        //Check if there are enough copies to checkout
        const bookCount = this.books[isbn].nCopies;
        if (this.bookCheckouts[isbn].length >= bookCount) {
            return Errors.errResult(`no copies of book ${isbn} are available for checkout`, "BAD_REQ", "isbn");
        }
        //Add book to patron checkout list and add patron ID to book checkout list
        this.bookCheckouts[isbn].push(patronId);
        this.patronCheckouts[patronId].push(isbn);
        return Errors.okResult(undefined);
    }
    /** Set up patron req.patronId to returns book req.isbn.
     *
     *  Errors:
     *    MISSING: patronId or isbn field is missing
     *    BAD_TYPE: patronId or isbn field is not a string.
     *    BAD_REQ error on business rule violation.
     */
    returnBook(req) {
        //Validation
        const validationRes = checkoutBookValidation(req, this.books);
        if (!validationRes.isOk)
            return validationRes;
        const patronId = req.patronId;
        const isbn = req.isbn;
        //Check if checkout arrays are initialized yet
        //If not initialized, patron has not checked out anything
        if (!this.patronCheckouts[patronId] || !this.bookCheckouts[isbn])
            return Errors.errResult("Patron does not have the given book checked out", "BAD_REQ", "isbn");
        //Find index of checked out books/patron id in arrays
        const bookCheckoutIdx = this.bookCheckouts[isbn].indexOf(patronId);
        const patronCheckoutIdx = this.patronCheckouts[patronId].indexOf(isbn);
        //If index not found, book not checked out
        if (bookCheckoutIdx == -1 || patronCheckoutIdx == -1) {
            return Errors.errResult("Patron does not have the given book checked out", "BAD_REQ", "isbn");
        }
        //Remove book from patron's checked out books and remove patron id from book checkout list
        this.bookCheckouts[isbn].splice(bookCheckoutIdx, 1);
        this.patronCheckouts[patronId].splice(patronCheckoutIdx, 1);
        return Errors.okResult(undefined); //placeholder
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
function addBookValidation(req, books) {
    //Arrays for fields
    const fields = [req.isbn, req.title, req.authors, req.pages, req.year, req.publisher];
    const fieldNames = ["isbn", "title", "authors", "pages", "year", "publisher"];
    const types = ["string", "string", "Array", "number", "number", "string"];
    //Check for missing fields
    for (let i = 0; i < fieldNames.length; i++) {
        if (!Object.hasOwn(req, fieldNames[i])) {
            return Errors.errResult(`property ${fieldNames[i]} is required`, "MISSING", fieldNames[i]);
        }
    }
    //Type/input checking
    for (let i = 0; i < fields.length; i++) {
        //Input checking for authors field
        if (fieldNames[i] === "authors") {
            if (!Array.isArray(fields[i])) {
                return Errors.errResult("authors must have type string[]", "BAD_TYPE", fieldNames[i]);
            }
            if (req.authors.length === 0) {
                return Errors.errResult("Field 'authors' must be at least contain one author", "BAD_TYPE", fieldNames[i]);
            }
            if (req.authors.some((author) => typeof author !== "string")) {
                return Errors.errResult("authors must have type string[]", "BAD_TYPE", fieldNames[i]);
            }
        }
        else if (typeof fields[i] !== types[i]) {
            const msg = `property ${fieldNames[i]} must be a ${types[i]}.`;
            return Errors.errResult(msg, "BAD_TYPE", fieldNames[i]);
        }
    }
    //Checking nCopies for >0 integer
    if (Object.hasOwn(req, "nCopies")) {
        if (typeof req.nCopies !== "number") {
            return Errors.errResult("nCopies must be a number", "BAD_TYPE", "nCopies");
        }
        if (!Number.isInteger(req.nCopies)) {
            return Errors.errResult("nCopies must be an integer", "BAD_REQ", "nCopies");
        }
        else if (req.nCopies <= 0) {
            return Errors.errResult("nCopies must be greater than zero", "BAD_REQ", "nCopies");
        }
    }
    if (req.isbn in books) {
        const existingBook = books[req.isbn];
        const existingFields = [existingBook.isbn, existingBook.title, existingBook.authors,
            existingBook.pages, existingBook.year, existingBook.publisher];
        for (let i = 0; i < fields.length; i++) {
            if (fieldNames[i] === "authors") {
                for (let j = 0; j < req.authors.length; j++) {
                    if (req.authors[i] !== existingBook.authors[i]) {
                        return Errors.errResult(`inconsistent title data for book ${req.isbn}`, "BAD_TYPE", "authors");
                    }
                }
            }
            else if (fields[i] !== existingFields[i]) {
                return Errors.errResult(`inconsistent title data for book ${req.isbn}`, "BAD_TYPE", fieldNames[i]);
            }
        }
    }
    return Errors.okResult("OK");
}
//Validate input for function checkoutBook() and returnBook()
function checkoutBookValidation(req, bookList) {
    //Check if input is valid
    if (!(typeof req.isbn === "string")) {
        return Errors.errResult(`property isbn must be a string"`, "BAD_TYPE", "isbn");
    }
    if (!(typeof req.patronId === "string")) {
        return Errors.errResult(`property patronId must be a string"`, "BAD_TYPE", "patronId");
    }
    //Check if isbn is valid
    if (!(req.isbn in bookList)) {
        return Errors.errResult(`unknown book ${req.isbn}`, "BAD_REQ", "nCopies");
    }
    return Errors.okResult("OK");
}
/********************* General Utility Functions ***********************/
//TODO: add general utility functions or classes.
//Add each word in authors list and title to the search list
function updateSearchList(book, searchList) {
    const bookWords = new Set();
    //Putting all distinct words into a set
    for (const author of book.authors) {
        const words = author.match(/\w+/g) || [];
        for (const word of words) {
            bookWords.add(word);
        }
    }
    const words = book.title.match(/\w+/g) || [];
    for (const word of words) {
        bookWords.add(word);
    }
    //Updating searchList
    for (const word of bookWords) {
        if (word in searchList) {
            searchList[word].push(book.isbn);
        }
        else {
            searchList[word] = [book.isbn];
        }
    }
}
//# sourceMappingURL=lending-library.js.map