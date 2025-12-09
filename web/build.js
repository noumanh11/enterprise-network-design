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

// Save original working directory (where Vercel runs from)
const originalCwd = process.cwd();
console.log('Original working directory (where Vercel runs):', originalCwd);

// Change to project root to run build
process.chdir(projectRoot);
console.log('Current directory after chdir:', process.cwd());
console.log('Verifying public directory will be created at:', path.join(projectRoot, 'public'));

try {
  require(mainBuildScript);
  console.log('\n✓ Build script completed successfully');
  
  // After build, also create public directory in original location (where Vercel might look)
  const publicInProjectRoot = path.join(projectRoot, 'public');
  const publicInOriginalCwd = path.join(originalCwd, 'public');
  
  if (fs.existsSync(publicInProjectRoot) && publicInProjectRoot !== publicInOriginalCwd) {
    console.log('\nCopying public directory to original working directory...');
    console.log(`From: ${publicInProjectRoot}`);
    console.log(`To: ${publicInOriginalCwd}`);
    
    // Copy entire public directory to original location
    if (fs.existsSync(publicInOriginalCwd)) {
      // Delete existing
      function deleteDir(dir) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              deleteDir(filePath);
            } else {
              fs.unlinkSync(filePath);
            }
          }
          fs.rmdirSync(dir);
        }
      }
      deleteDir(publicInOriginalCwd);
    }
    
    // Copy directory
    function copyDirSync(src, dest) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyDirSync(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    copyDirSync(publicInProjectRoot, publicInOriginalCwd);
    console.log('✓ Copied public directory to original working directory');
  }
  
} catch (error) {
  console.error('✗ ERROR: Build script failed:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

