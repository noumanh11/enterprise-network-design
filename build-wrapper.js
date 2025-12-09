// Wrapper script to find and run build.js from anywhere
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Try to find build.js in current directory or parent
let buildScript = null;
const currentDir = process.cwd();
const scriptDir = __dirname;

// Check current directory
if (fs.existsSync(path.join(currentDir, 'build.js'))) {
  buildScript = path.join(currentDir, 'build.js');
}
// Check script directory (where this file is)
else if (fs.existsSync(path.join(scriptDir, 'build.js'))) {
  buildScript = path.join(scriptDir, 'build.js');
}
// Check parent directory
else if (fs.existsSync(path.join(currentDir, '..', 'build.js'))) {
  buildScript = path.join(currentDir, '..', 'build.js');
}
// Check script's parent
else if (fs.existsSync(path.join(scriptDir, '..', 'build.js'))) {
  buildScript = path.join(scriptDir, '..', 'build.js');
}

if (!buildScript) {
  console.error('ERROR: Could not find build.js');
  console.error('Current directory:', currentDir);
  console.error('Script directory:', scriptDir);
  process.exit(1);
}

console.log('Found build.js at:', buildScript);
console.log('Running build script...');

// Change to the directory containing build.js and run it
const buildDir = path.dirname(buildScript);
process.chdir(buildDir);
require(buildScript);

