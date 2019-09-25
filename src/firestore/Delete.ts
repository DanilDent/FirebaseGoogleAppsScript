namespace Firestore {
  /**
   * Delete the Firestore document at the given path.
   * Note: this deletes ONLY this document, and not any subcollections.
   *
   * @param {string} path the path to the document to delete
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} the JSON response from the DELETE request
   */
  export function deleteDocument(path: string, request: FirebaseRequest): any {
    return request.remove(path);
  }
}
