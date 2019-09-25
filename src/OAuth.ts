
namespace OAuth {

    /**
     * Auth token is formatted to
     * {@link https://developers.google.com/identity/protocols/OAuth2ServiceAccount#authorizingrequests}
     *
     * @private
     * @param email the database service account email address
     * @param key the database service account private key
     * @param authUrl the authorization url
     * @returns {string} the access token needed for making future requests
     */
    export function getAuthToken(email: string, key: string, authUrl: string, scope: string): string {
        const jwt = createJwt(email, key, authUrl, scope);

        const options = {
            payload: "grant_type=" +
                decodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + jwt,
        };
        const responseObj: any = new FirebaseRequest(authUrl, null, options).post();
        return responseObj.access_token;
    }

    /**
     * Creates the JSON Web Token for OAuth 2.0
     *
     * @private
     * @param email the database service account email address
     * @param key the database service account private key
     * @param authUrl the authorization url
     * @returns {string} JWT to utilize
     */
    function createJwt(email: string, key: string, authUrl: string, scope: string): string {
        const jwtHeader = {
            alg: "RS256",
            typ: "JWT",
        };

        const now = new Date();
        const nowSeconds = now.getTime() / 1000;

        now.setHours(now.getHours() + 1);
        const oneHourFromNowSeconds = now.getTime() / 1000;

        const jwtClaim = {
            aud: authUrl,
            exp: oneHourFromNowSeconds,
            iat: nowSeconds,
            iss: email,
            scope,
        };

        const jwtHeaderBase64 = Util.base64EncodeSafe(JSON.stringify(jwtHeader));
        const jwtClaimBase64 = Util.base64EncodeSafe(JSON.stringify(jwtClaim));

        const signatureInput = jwtHeaderBase64 + "." + jwtClaimBase64;

        const signature = Utilities.computeRsaSha256Signature(signatureInput, key);
        const encodedSignature = Util.base64EncodeSafe(signature);

        return signatureInput + "." + encodedSignature;
    }
}
