namespace Firebase {

  const authURL: string = "https://oauth2.googleapis.com/token";

  export class Connection {
    private projectId: string;
    private email: string;
    private key: string;
    // tslint:disable-next-line: variable-name
    private _firestore: Firestore.Connection | null = null;
    // tslint:disable-next-line: variable-name
    private _remoteConfig: RemoteConfig.Connection | null = null;
    constructor(email: string, key: string, projectId: string) {
      this.projectId = projectId;
      this.email = email;
      this.key = key;
    }

    public firestore(): Firestore.Connection {
      if (this._firestore === null) {
        const authToken = OAuth.getAuthToken(this.email, this.key, authURL, "https://www.googleapis.com/auth/datastore");
        this._firestore = new Firestore.Connection(authToken, this.projectId);
      }
      return this._firestore;
    }

    public remoteConfig(): RemoteConfig.Connection {
      if (this._remoteConfig === null) {
        const authToken = OAuth.getAuthToken(this.email, this.key, authURL, "https://www.googleapis.com/auth/firebase.remoteconfig");
        this._remoteConfig = new RemoteConfig.Connection(authToken, this.projectId);
      }
      return this._remoteConfig;
    }
  }
}
