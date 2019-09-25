
let testFirebase: Firebase.Connection;

function getProps(): any {
  const scriptProperties = PropertiesService.getScriptProperties();
  const props = scriptProperties.getProperties();
  return props;
}

function getTestFirebase(): Firebase.Connection {
  const props = getProps();
  if (!testFirebase) {
    testFirebase = getFirebase(props.email, props.key.replace(/\\n/g, "\n"), props.projectId);
  }
  return testFirebase;
}

function getTestPosts() {
  const firebase = getTestFirebase();
  const firestore = firebase.firestore();
  if (!firestore) { throw new Error(); }
  const posts = firestore.getDocuments("posts");
  Logger.log(posts);
  return posts;
}
