namespace Firestore {
  /**
   * Create a document with the given ID and fields.
   *
   * @private
   * @param {string} path the path where the document will be written
   * @param {string} documentId the document's ID in Firestore
   * @param {object} fields the document's fields
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} the Document object written to Firestore
   */
  export function createDocument(path: string, fields: any, request: FirebaseRequest): any {
    const pathDoc = Util.getDocumentFromPath(path);
    const firestoreObject = Firestore.createFirestoreDocument(fields);
    const documentId = pathDoc[1];

    if (documentId) {
      request.addParam("documentId", documentId);
    }
    return request.post(pathDoc[0], firestoreObject);
  }

  /**
   * Update/patch a document at the given path with new fields.
   *
   * @private
   * @param {string} path the path of the document to update
   * @param {object} fields the document's new fields
   * @param {string} request the Firestore Request object to manipulate
   * @param {boolean} if true, the update will use a mask
   * @return {object} the Document object written to Firestore
   */
  export function updateDocument(path: string, fields: any, request: FirebaseRequest, mask: boolean): any {
    if (mask) {
      // abort request if fields object is empty
      if (!Object.keys(fields).length) {
        return;
      }
      // tslint:disable-next-line: forin
      for (const field in fields) {
        request.addParam("updateMask.fieldPaths", field);
      }
    }

    const firestoreObject = Firestore.createFirestoreDocument(fields);

    return request.patch(path, firestoreObject);
  }
}
