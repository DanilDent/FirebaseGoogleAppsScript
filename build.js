const ts2gas = require('ts2gas');
const fs = require('fs-extra');
const path = require('path');
const tsConfig = require('./tsconfig.json');

// paths
const rootDir = tsConfig.compilerOptions.rootDir;
const outDir = tsConfig.compilerOptions.outDir;
const manifest = 'appsscript.json';

function compileFile(file) {
  if (/\.ts$/i.test(file) && !/\.d.ts$/i.test(file)) {
    const dirName = path.dirname(file).replace(rootDir,outDir);
    const fileName = path.basename(file).replace('.ts', '.gs');
    fs.mkdirpSync(dirName);
    const tsCode = fs.readFileSync(file, 'utf-8');
    // Send to ts2gas
    const gasCode = ts2gas(tsCode);
    // Write out transpiled GS
    const compiledFile = path.normalize(`${dirName}/${fileName}`);
    console.log(`Compiling ${file} to ${compiledFile}`);
    fs.writeFileSync(compiledFile, gasCode);
  }
}

function walk(dir, done) {
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null);
      file = dir + '/' + file;
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            next();
          });
        } else {
          compileFile(file);
          next();
        }
      });
    })();
  });
};

walk(rootDir, (err) => {
  if (err) throw err;

  // now make sure we can copy over the appsscript.json
  if (!fs.existsSync(manifest)) throw new Error('There is no appsscript.json');
  fs.copyFile(manifest, path.normalize(`${outDir}/${manifest}`), (err) => {
    if (err) throw err;
    console.log('Successfully compiled TS to GAS');
  });
});
