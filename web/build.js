// Build script placed in web directory for Vercel compatibility
// This script finds the project root and runs the main build
const fs = require('fs');
const path = require('path');

console.log('=== Web Directory Build Script ===');
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);

// We're in web/, so go up one level to find project root
const projectRoot = path.join(__dirname, '..');
const mainBuildScript = path.join(projectRoot, 'build.js');

console.log('Project root:', projectRoot);
console.log('Looking for main build.js at:', mainBuildScript);

if (!fs.existsSync(mainBuildScript)) {
  console.error('✗ ERROR: Could not find build.js in project root');
  console.error('Project root contents:', fs.existsSync(projectRoot) ? fs.readdirSync(projectRoot) : 'Does not exist');
  process.exit(1);
}

console.log('✓ Found main build.js, changing to project root and running...\n');
process.chdir(projectRoot);
console.log('Current directory after chdir:', process.cwd());
console.log('Verifying public directory will be created at:', path.join(projectRoot, 'public'));

try {
  require(mainBuildScript);
  console.log('\n✓ Build script completed successfully');
} catch (error) {
  console.error('✗ ERROR: Build script failed:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

