namespace Util {
    /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
    /* globals UrlFetchApp, Utilities */

    // RegEx test for root path references. Groups relative path for extraction.
    export const regexPath = /^projects\/.+?\/databases\/\(default\)\/documents\/(.+\/.+)$/;
    // RegEx test for testing for binary data by checking for non-printable characters.
    // Parsing strings for binary data is completely dependent on the data being sent over.
    export const regexBinary = /[\x00-\x08\x0E-\x1F]/;

    // Assumes n is a Number.
    export function isInt_(n: number) {
        return n % 1 === 0;
    }

    export function isNumeric_(val: any) {
        return Number(parseFloat(val)) === val;
    }

    export function base64EncodeSafe_(toEncode: any): string {
        const encoded = Utilities.base64EncodeWebSafe(toEncode);
        return encoded.replace(/=/g, "");
    }

    export function fetchObject_<T>(url: string, options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions): T {
        const response = UrlFetchApp.fetch(url, options);
        const responseObj: T = JSON.parse(response.getContentText());
        checkForError_(responseObj);
        return responseObj;
    }

    export function checkForError_(responseObj: any) {
        // tslint:disable-next-line: no-string-literal
        if (responseObj["error"]) {
            // tslint:disable-next-line: no-string-literal
            throw new Error(responseObj["error"]["message"]);
        }
        // tslint:disable-next-line: no-string-literal
        if (Array.isArray(responseObj) && responseObj.length && responseObj[0]["error"]) {
            // tslint:disable-next-line: no-string-literal
            throw new Error(responseObj[0]["error"]["message"]);
        }
    }
    export function getCollectionFromPath_(path: string) {
        return getColDocFromPath_(path, false);
    }
    export function getDocumentFromPath_(path: string) {
        return getColDocFromPath_(path, true);
    }

    export function getColDocFromPath_(path: string, isDocument: any) {
        // Path defaults to empty string if it doesn't exist. Remove insignificant slashes.
        const splitPath = (path || "").split("/").filter((p) => {
            return p;
        });
        const len = splitPath.length;

        // Set item path to document if isDocument, otherwise set to collection if exists.
        // This works because path is always in the format of "collection/document/collection/document/etc.."
        // tslint:disable-next-line: no-bitwise
        const item = len && len & 1 ^ isDocument ? splitPath.splice(len - 1, 1)[0] : "";

        // Remainder of path is in splitPath. Put back together and return.
        return [splitPath.join("/"), item];
    }

    /**
     * Check if a value is of type Number but is NaN.
     *  This check prevents seeing non-numeric values as NaN.
     *
     * @param {value} the value to check
     * @returns {boolean} whether the given value is of type number and equal to NaN
     */
    export function isNumberNaN(value: any): boolean {
        return typeof (value) === "number" && isNaN(value);
    }

}
