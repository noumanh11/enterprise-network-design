// Wrapper script to find and run build.js from anywhere
const fs = require('fs');
const path = require('path');

console.log('=== Build Wrapper Script ===');
console.log('Current working directory:', process.cwd());
console.log('Script directory (__dirname):', __dirname);

// Try to find build.js in multiple locations
let buildScript = null;
const currentDir = process.cwd();
const scriptDir = __dirname;

const searchPaths = [
  path.join(currentDir, 'build.js'),
  path.join(scriptDir, 'build.js'),
  path.join(currentDir, '..', 'build.js'),
  path.join(scriptDir, '..', 'build.js'),
  path.join(currentDir, '..', '..', 'build.js'),
];

console.log('Searching for build.js in:');
searchPaths.forEach(p => console.log('  -', p));

for (const searchPath of searchPaths) {
  if (fs.existsSync(searchPath)) {
    buildScript = searchPath;
    console.log('✓ Found build.js at:', buildScript);
    break;
  }
}

if (!buildScript) {
  console.error('✗ ERROR: Could not find build.js');
  console.error('Current directory:', currentDir);
  console.error('Script directory:', scriptDir);
  console.error('Current directory contents:', fs.existsSync(currentDir) ? fs.readdirSync(currentDir) : 'Directory does not exist');
  console.error('Script directory contents:', fs.existsSync(scriptDir) ? fs.readdirSync(scriptDir) : 'Directory does not exist');
  process.exit(1);
}

console.log('Changing to build script directory:', path.dirname(buildScript));

try {
  // Change to the directory containing build.js and run it
  const buildDir = path.dirname(buildScript);
  process.chdir(buildDir);
  console.log('Current directory after chdir:', process.cwd());
  console.log('Running build.js...\n');
  
  // Use require to run the build script
  require(buildScript);
} catch (error) {
  console.error('✗ ERROR running build.js:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

