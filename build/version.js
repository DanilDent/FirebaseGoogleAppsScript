const { script_v1 } = require("googleapis");
const { loadAPICredentials, script } = require("@google/clasp/src/auth");
const { ERROR, LOG, checkIfOnline, getProjectSettings, logError, handleError, PROJECT_MANIFEST_BASENAME } = require("@google/clasp/src/utils");
const semver = require("semver");
const commander = require("commander");

async function getVersions(scriptId) {
  const versions = await script.projects.versions.list({
    scriptId,
    pageSize: 500,
  });
  if (versions.status === 200) {
    const data = versions.data;
    if (data && data.versions && data.versions.length) {
      data.versions.reverse();
      return data.versions;
    } else {
      logError(null, LOG.DEPLOYMENT_DNE);
    }
  } else {
    logError(versions.statusText);
  }

}

async function createVersion(scriptId, versionNumber, description) {
  return await script.projects.versions.create({
    scriptId,
    requestBody: {
      versionNumber,
      description,
    },
  });
}

async function createDeployment(scriptId, versionNumber, description) {
  return await script.projects.deployments.create({
      scriptId,
      requestBody: {
        versionNumber,
        manifestFileName: PROJECT_MANIFEST_BASENAME,
        description,
      },
    });
}

async function gasDeploy(tag, description){

  console.log(`Attempt to bump version to: ${tag} - ${description}`);

  // get the clean semver from the passed in tag and the current NPM version and check if they are not the same
  const npmVersion = semver.clean(process.env.npm_package_version);
  const gitVersion = semver.clean(tag);
  if (gitVersion !== npmVersion) {
    // if two versions are not the same then npm version was probably not run
    console.log(`The tags were not the same: ${gitVersion} - ${npmVersion}`);
    return null;
  }

  const npmMajor = semver.major(npmVersion);

  await checkIfOnline();
  await loadAPICredentials();
  const { scriptId } = await getProjectSettings();

  const versions = await getVersions(scriptId);
  const latestVersion = versions[0];
  let curVersion;

  // if the major version is higher than current version then make new gas version
  if (+npmMajor > +latestVersion.versionNumber) {
    console.log(`A new version @${npmMajor} and description is`,description);
    curVersion = await createVersion(scriptId, npmMajor, description);
  } else {
    curVersion = latestVersion;
  }

  const deployment = await createDeployment(scriptId, curVersion.versionNumber, description);
  if (deployment.status !== 200) logError(null, ERROR.DEPLOYMENT_COUNT);
  console.log(`- ${deployment.data.deploymentId} @${curVersion.versionNumber}.`);
}

commander
  .arguments('[tag] [description]')
  .description('Creates an immutable version of the script')
  .action(handleError(gasDeploy))
  .parse(process.argv);
