
class FirebaseRequest {

    private url: string;
    private options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
    private queryString: string = "";
    private authToken: string | null;

    constructor(
        url: string,
        authToken: string | null,
        options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
    ) {
        this.url = url;
        this.authToken = authToken;
        this.options = options || {
            headers: {
                "Authorization": "Bearer " + authToken,
                "content-type": "application/json",
            },
        };
        this.options.muteHttpExceptions = true;
    }

    /**
     * Adds a parameter to the URL query string.
     *  Can be repeated for additional key-value mappings
     *
     * @param key the key to add
     * @param value the value to set
     * @returns {FirebaseRequest} this request to be chained
     */
    public addParam(key: string, value: any): FirebaseRequest {
        key = encodeURI(key);
        value = encodeURI(value);
        this.queryString += (this.queryString.indexOf("?") === -1 ? "?" : "&") + key + "=" + value;
        return this;
    }
    /**
     * Set request as a GET method
     *
     * @param path the path to send the request to
     * @returns this request to be chained
     */
    public get(path: string): any {
        return this.method("get", path);
    }

    /**
     * Set request as a POST method
     *
     * @param path the path to send the request to
     * @param obj Optional object to send as payload
     * @returns this request to be chained
     */
    public post(path: string | null = null, obj?: any): any {
        if (obj) {
            this.payload(obj);
        }
        return this.method("post", path);
    }

    /**
     * Set request as a PATCH method.
     *
     * @param path the path to send the request to
     * @param obj Optional object to send as payload
     * @returns this request to be chained
     */
    public patch(path: string, obj: any): any {
        if (obj) {
            this.payload(obj);
        }
        return this.method("patch", path);
    }

    /**
     * Set request as a DELETE method (delete is a keyword)
     *
     * @param path the path to send the request to
     * @returns this request to be chained
     */
    public remove(path: string) {
        return this.method("delete", path);
    }

    /**
     * Used to clone the request instance. Useful for firing multiple requests.
     *
     * @returns {FirebaseRequest} A copy of this object
     */
    public clone(): FirebaseRequest {
        return new FirebaseRequest(this.url, this.authToken, this.options);
    }

    private payload(obj: any): void {
        this.options.payload = JSON.stringify(obj);
    }

    private method(type: any, path: string | null): any {
        this.options.method = type;
        return Util.fetchObject_(this.url + (path || "") + this.queryString, this.options);
    }
}
