namespace Firebase {
    export class Connection {
        private projectId: string;
        private email: string;
        private key: string;
        private authToken: string | null = null;
        // tslint:disable-next-line: variable-name
        private _firestore: Firestore.Connection | null = null;
        constructor(projectId: string, email: string, key: string) {
            this.projectId = projectId;
            this.email = email;
            this.key = key;
        }

        public initialize() {
            if (this.authToken === null) {
                this.authToken = OAuth.getAuthToken(this.email, this.key, "https://oauth2.googleapis.com/token");
            }
        }

        public firestore() {
            if (this._firestore === null && this.authToken !== null) {
                this._firestore = new Firestore.Connection(this.authToken, this.projectId);
            } else if (this.authToken === null) {
                throw new Error("Firebase is not initialized");
            }
            return this._firestore;
        }
    }
}
