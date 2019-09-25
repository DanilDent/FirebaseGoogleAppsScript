namespace Firestore {
  /**
   * Create a Firestore documents with the corresponding fields.
   *
   * @param {object} fields the document's fields
   * @return {object} a Firestore document with the given fields
   */
  export function createFirestoreDocument(fields: any): any {
    const keys = Object.keys(fields);
    const fieldsObj = keys.reduce((o: any, key: string) => {
      o[key] = wrapValue(fields[key]);
      return o;
    }, {});

    return { fields: fieldsObj };
  }

  /**
   * Extract fields from a Firestore document.
   *
   * @param {object} firestoreDoc the Firestore document whose fields will be extracted
   * @return {object} an object with the given document's fields and values
   */
  function getFieldsFromFirestoreDocument(firestoreDoc: any): any {
    if (!firestoreDoc || !firestoreDoc.fields) {
      return {};
    }

    const fields = firestoreDoc.fields;
    const keys = Object.keys(fields);
    const object = keys.reduce((o: any, key: string) => {
      o[key] = unwrapValue(fields[key]);
      return o;
    }, {});

    return object;
  }

  /**
   * Unwrap the given document response's fields.
   *
   * @private
   * @param docResponse the document response
   * @return the document response, with unwrapped fields
   */
  export function unwrapDocumentFields(docResponse: any): any {
    if (docResponse.fields) {
      docResponse.fields = getFieldsFromFirestoreDocument(docResponse);
    }
    return docResponse;
  }

  export function wrapValue(value: any | any[]): any {
    const type = typeof (value);
    switch (type) {
      case "string":
        return wrapString(value);
      case "object":
        return wrapObject(value);
      case "number":
        return wrapNumber(value);
      case "boolean":
        return wrapBoolean(value);
      default: // error
        return null;
    }
  }

  function unwrapValue(value: any) {
    const type = Object.keys(value)[0];
    value = value[type];
    switch (type) {
      case "referenceValue":
      case "bytesValue":
      case "stringValue":
      case "booleanValue":
      case "doubleValue":
        return value;
      case "integerValue":
        // tslint:disable-next-line: radix
        return parseInt(value);
      case "geoPointValue":
        value = createFirestoreDocument(value);
      // Transform coordinates as mapValue object type
      // fall through
      case "mapValue":
        return getFieldsFromFirestoreDocument(value);
      case "arrayValue":
        return unwrapArray(value.values);
      case "timestampValue":
        return new Date(value);
      case "nullValue":
      default: // error
        return null;
    }
  }

  function wrapString(value: string) {
    // Test for root path reference inclusion (see Util.js)
    if (Util.regexPath.test(value)) {
      return wrapRef(value);
    }

    // Test for binary data in string (see Util.js)
    if (Util.regexBinary.test(value)) {
      return wrapBytes(value);
    }

    return { stringValue: value };
  }

  function wrapObject(object: any | any[]) {
    if (!object) {
      return wrapNull();
    }

    if (Array.isArray(object)) {
      return wrapArray(object);
    }

    if (object instanceof Date) {
      return wrapDate(object);
    }

    if (Object.keys(object).length === 2 && "latitude" in object && "longitude" in object) {
      return wrapLatLong(object);
    }

    return { mapValue: createFirestoreDocument(object) };
  }

  function wrapNull() {
    return { nullValue: null };
  }

  function wrapBytes(bytes: any) {
    return { bytesValue: bytes };
  }

  function wrapRef(ref: any) {
    return { referenceValue: ref };
  }

  function wrapNumber(num: number) {
    if (Util.isInt(num)) {
      return wrapInt(num);
    } else {
      return wrapDouble(num);
    }
  }

  function wrapInt(int: number) {
    return { integerValue: int };
  }

  function wrapDouble(value: number) {
    return { doubleValue: value };
  }

  function wrapBoolean(value: boolean) {
    return { booleanValue: value };
  }

  function wrapDate(value: any) {
    return { timestampValue: value };
  }

  function wrapLatLong(latLong: any) {
    return { geoPointValue: latLong };
  }

  function wrapArray(value: any[]) {
    const wrappedArray = value.map(wrapValue);
    return { arrayValue: { values: wrappedArray } };
  }

  function unwrapArray(wrappedArray: any) {
    const array = (wrappedArray || []).map(unwrapValue);
    return array;
  }

}
