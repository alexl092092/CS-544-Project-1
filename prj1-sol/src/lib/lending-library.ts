import { Errors } from 'cs544-js-utils';

/** Note that errors are documented using the `code` option which must be
 *  returned (the `message` can be any suitable string which describes
 *  the error as specifically as possible).  Whenever possible, the
 *  error should also contain a `widget` option specifying the widget
 *  responsible for the error).
 *
 *  Note also that none of the function implementations should normally
 *  require a sequential scan over all books or patrons.
 */

/******************** Types for Validated Requests *********************/

/** used as an ID for a book */
type ISBN = string; 

/** used as an ID for a library patron */
type PatronId = string;

export type Book = {
  isbn: ISBN;
  title: string;
  authors: string[];
  pages: number;      //must be int > 0
  year: number;       //must be int > 0
  publisher: string;
  nCopies?: number;   //# of copies owned by library; not affected by borrows;
                      //must be int > 0; defaults to 1
};

export type XBook = Required<Book>;

type AddBookReq = Book;
type FindBooksReq = { search: string; };
type ReturnBookReq = { patronId: PatronId; isbn: ISBN; };
type CheckoutBookReq = { patronId: PatronId; isbn: ISBN; };

/************************ Main Implementation **************************/

export function makeLendingLibrary() {
  return new LendingLibrary();
}

export class LendingLibrary {

  //TODO: declare private TS properties for instance
  
  private books: Record<ISBN, XBook>;
  private searchList: Record<string, ISBN[]>;
  private bookCheckouts: Record<ISBN, PatronId[]>;
  private patronCheckouts: Record<PatronId, ISBN[]>;
  
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
  addBook(req: Record<string, any>): Errors.Result<XBook> {
    //TODO
    const validationRes: Errors.Result<string> = addBookValidation(req);
    if(!validationRes.isOk) return validationRes;

    //Adding book to library
    const bookISBN: string = req.isbn;
    const book: XBook = {
      isbn: req.isbn,
      title: req.title,
      authors: req.authors,
      pages: req.pages,
      year: req.year,
      publisher: req.publisher,
      nCopies: req.nCopies ?? 1,
    };

    if(bookISBN in this.books)
      this.books[bookISBN].nCopies += book.nCopies;
    else
      this.books[bookISBN] = book;


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
  findBooks(req: Record<string, any>) : Errors.Result<XBook[]> {
    //TODO
    return Errors.errResult('TODO');  //placeholder
  }


  /** Set up patron req.patronId to check out book req.isbn. 
   * 
   *  Errors:
   *    MISSING: patronId or isbn field is missing
   *    BAD_TYPE: patronId or isbn field is not a string.
   *    BAD_REQ error on business rule violation.
   */
  checkoutBook(req: Record<string, any>) : Errors.Result<void> {
    //TODO
    return Errors.errResult('TODO');  //placeholder
  }

  /** Set up patron req.patronId to returns book req.isbn.
   *  
   *  Errors:
   *    MISSING: patronId or isbn field is missing
   *    BAD_TYPE: patronId or isbn field is not a string.
   *    BAD_REQ error on business rule violation.
   */
  returnBook(req: Record<string, any>) : Errors.Result<void> {
    //TODO 
    return Errors.errResult('TODO');  //placeholder
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
  function addBookValidation(req: Record<string, any>): Errors.Result<string>{
    //Array of all fields
    const fields: (string | number | string[])[] = [req.isbn, req.title, req.authors, req.pages, req.year, req.publisher];
    const fieldNames: string[] = ["isbn", "title", "authors", "pages", "year", "publisher"];
    const types: string[] = ["string", "string", "Array", "number", "number", "string"];
    //Check for missing fields
    //console.log("reachong here 1");
    for(let i: number = 0; i < fieldNames.length; i++){
      if(!Object.hasOwn(req, fieldNames[i])){   
        return Errors.errResult("Missing one or more required fields", "MISSING", fieldNames[i]);
      }
    }

    // console.log("reachong here 3");

    //Type/input checking
    for(let i: number = 0; i < fields.length; i++){
      //Input checking for authors field
      if(fieldNames[i] === "authors"){
        if(!Array.isArray(fields[i])){
          return Errors.errResult("Field 'authors' must be an array of strings", "BAD_TYPE", fieldNames[i]);
        }
        if(req.authors.length === 0){
          return Errors.errResult("Field 'authors' must be at least contain one author", "BAD_TYPE", fieldNames[i]);
        }
        if(req.authors.some((author: string) => typeof author !== "string")){
          return Errors.errResult("Field 'authors' must be an array of strings", "BAD_TYPE", fieldNames[i]);
        }
      }
      else if(typeof fields[i] !== types[i]){
        const msg: string = `Field ${fieldNames[i]} must be a ${types[i]}.`;
        return Errors.errResult(msg, "BAD_TYPE", fieldNames[i]);
      }
    }

    //Checking nCopies for >0 integer
    if(Object.hasOwn(req, "nCopies")){
        if(typeof req.nCopies !== "number"){
          return Errors.errResult("nCopies must be a number", "BAD_TYPE", "nCopies");
        }
        if(!Number.isInteger(req.nCopies)){
          return Errors.errResult("nCopies must be an integer", "BAD_REQ", "nCopies");
        }
        else if(req.nCopies <= 0){
          return Errors.errResult("nCopies must be greater than zero", "BAD_REQ", "nCopies")
        }
      }




      return Errors.okResult("OK");
    }

  //   return Errors.errResult("TODO");
  // }
/********************* General Utility Functions ***********************/

//TODO: add general utility functions or classes.

function updateSearchList(book: XBook, searchList: Record<string, ISBN[]>): void{
    //Adding words to search list   
    const bookWords: Set<string> = new Set<string>();

    //Putting all distinct words into a set
    for(const author of book.authors){
      const words: string[] = author.match(/\w+/g) || [];
      for(const word of words){
        bookWords.add(word);
      }
    }
    const words: string[] = book.title.match(/\w+/g) || [];
    for(const word of words){
      bookWords.add(word);
    }

    //Updating searchList
    for(const word of bookWords){
      if(word in this.searchList){
        this.searchList[word].push(book.isbn);
      }
      else{
        this.searchList[word] = [book.isbn];
      }
    }
}