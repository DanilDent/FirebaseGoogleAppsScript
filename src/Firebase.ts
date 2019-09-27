namespace Firebase {

  const authURL: string = "https://oauth2.googleapis.com/token";

  export enum SCOPES {
    FIRESTORE = "https://www.googleapis.com/auth/datastore",
    REMOTE_CONFIG = "https://www.googleapis.com/auth/firebase.remoteconfig",
  }

  export class Connection {
    private projectId: string;

    // tslint:disable-next-line: variable-name
    private _firestore: Firestore.Connection | null = null;
    // tslint:disable-next-line: variable-name
    private _remoteConfig: RemoteConfig.Connection | null = null;
    constructor(projectId: string) {
      this.projectId = projectId;
    }

    public authToken(email: string, key: string, scopes: string[]) {
      return OAuth.getAuthToken(email, key, authURL, scopes.join(" "));
    }

    public firestore(authToken: string | null = null): Firestore.Connection {
      if (authToken !== null && this._firestore === null) {
        this._firestore = new Firestore.Connection(authToken, this.projectId);
      } else if (authToken === null && this._firestore === null) {
        throw new Error("No OAuth token then no Firestore");
      }

      if (this._firestore instanceof Firestore.Connection) {
        return this._firestore;
      } else {
        throw new Error("Could not get the Firestore");
      }
    }

    public remoteConfig(authToken: string | null = null): RemoteConfig.Connection {
      if (authToken !== null && this._remoteConfig === null) {
        this._remoteConfig = new RemoteConfig.Connection(authToken, this.projectId);
      } else if (authToken === null && this._remoteConfig === null) {
        throw new Error("No OAuth token then no RemoteConfig");
      }

      if (this._remoteConfig instanceof RemoteConfig.Connection) {
        return this._remoteConfig;
      } else {
        throw new Error("Could not get the RemoteConfig");
      }
    }
  }
}
