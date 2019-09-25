namespace RemoteConfig {
  export class Connection {
    private authToken: string;
    private baseUrl: string;
    constructor(authToken: string, projectId: string) {
      this.authToken = authToken;
      const HOST = "https://firebaseremoteconfig.googleapis.com";
      const PATH = "/v1/projects/" + projectId + "/remoteConfig";
      this.baseUrl = HOST + PATH;
    }
    /**
     * Get the remote config.
     *
     * @param {string} path the path to the document
     * @return {object} the document object
     */
    public get(): any {
      const request = new FirebaseRequest(this.baseUrl, this.authToken);
      return request.get("");
    }
  }
}
