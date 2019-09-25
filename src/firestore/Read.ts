namespace Firestore {
  /**
   * Get the Firestore document or collection at a given path.
   *  If the collection contains enough IDs to return a paginated result,
   *  this method only returns the first page.
   *
   * @private
   * @param {string} path the path to the document or collection to get
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} the JSON response from the GET request
   */
  export function get(path: string, request: FirebaseRequest): any {
    return getPage(path, null, request);
  }

  /**
   * Get a page of results from the given path.
   *  If null pageToken is supplied, returns first page.
   *
   * @private
   * @param {string} path the path to the document or collection to get
   * @param {string} request the Firestore Request object to manipulate
   * @param {string} pageToken if defined, is utilized for retrieving subsequent pages
   * @return {object} the JSON response from the GET request
   */
  function getPage(path: string, pageToken: string | null, request: FirebaseRequest): any {
    if (pageToken) {
      request.addParam("pageToken", pageToken);
    }
    return request.get(path);
  }

  /**
   * Get a list of the JSON responses received for getting documents from a collection.
   *  The items returned by this function are formatted as Firestore documents (with types).
   *
   * @private
   * @param {string} path the path to the collection
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} an array of Firestore document objects
   */
  export function getDocumentResponsesFromCollection(path: string, request: FirebaseRequest): any {
    const documents: any[] = [];
    let pageToken = null;

    do {
      const pageResponse = getPage(path, pageToken, request.clone());
      pageToken = pageResponse.nextPageToken;
      if (pageResponse.documents) {
        Array.prototype.push.apply(documents, pageResponse.documents);
      }
    } while (pageToken); // Get all pages of results if there are multiple

    return documents;
  }

  /**
   * Get a list of all IDs of the documents in a collection.
   *  Works with nested collections.
   *
   * @private
   * @param {string} path the path to the collection
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} an array of IDs of the documents in the collection
   */
  export function getDocumentIds(path: string, request: FirebaseRequest): any {
    const documents = query(path, request).select().execute();
    const ids = documents.map((doc: any) => {
      const ref = doc.name.match(Util.regexPath)[1]; // Gets the doc name field and extracts the relative path
      return ref.substr(path.length + 1); // Skip over the given path to gain the ID values
    });
    return ids;
  }

  /**
   * Get a document.
   *
   * @private
   * @param {string} path the path to the document
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} an object mapping the document's fields to their values
   */
  export function getDocument(path: string, request: FirebaseRequest): any {
    const doc = get(path, request);
    // tslint:disable-next-line: no-string-literal
    if (!doc["fields"]) {
      throw new Error("No document with `fields` found at path " + path);
    }
    return Firestore.unwrapDocumentFields(doc);
  }
  /**
   * Set up a Query to receive data from a collection
   *
   * @private
   * @param {string} path the path to the document or collection to query
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} A FirestoreQuery object to set up the query and eventually execute
   */
  export function query(path: string, request: FirebaseRequest): Firestore.QueryDef {
    const grouped = Util.getCollectionFromPath(path);
    const callback = (queryVal: any) => {
      // Send request to innermost document with given query
      const responseObj: any[] = request.post(grouped[0] + ":runQuery", {
        structuredQuery: queryVal,
      });

      // Filter out results without documents and unwrap document fields
      const documents = responseObj.reduce((docs: any, fireDoc: any) => {
        if (fireDoc.document) {
          docs.push(Firestore.unwrapDocumentFields(fireDoc.document));
        }
        return docs;
      }, []);

      return documents;
    };
    return new Firestore.QueryDef(grouped[1], callback);
  }
}
