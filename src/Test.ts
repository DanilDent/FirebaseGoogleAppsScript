
let testFirebase: Firebase.Connection;

function getProps(): any {
  const scriptProperties = PropertiesService.getScriptProperties();
  const props = scriptProperties.getProperties();
  return props;
}

function getTestFirebase(): Firebase.Connection {
  const props = getProps();
  if (!testFirebase) {
    testFirebase = getFirebase(props.projectId);
  }
  return testFirebase;
}

function getTestPosts() {
  const firebase = getTestFirebase();
  const props = getProps();
  try {
    const authToken = firebase.authToken(
      props.fire_email,
      props.fire_key.replace(/\\n/g, "\n"),
      [Firebase.SCOPES.FIRESTORE]);
    const firestore = firebase.firestore(authToken);
    const posts = firestore.getDocuments("posts");
    Logger.log(posts);
  } catch (error) {
    Logger.log(error);
  }
}

function getTestRemoteConfig() {
  const firebase = getTestFirebase();
  const props = getProps();
  try {
    const authToken = firebase.authToken(
      props.rc_email,
      props.rc_key.replace(/\\n/g, "\n"),
      [Firebase.SCOPES.REMOTE_CONFIG]);
    const remoteConfig = firebase.remoteConfig(authToken);
    const config = remoteConfig.get();
    Logger.log(config);
  } catch (error) {
    Logger.log(error);
  }
}
