// Build script placed in web directory for Vercel compatibility
// This script finds the project root and runs the main build
const fs = require('fs');
const path = require('path');

console.log('=== Web Directory Build Script ===');
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);

// Save original working directory FIRST (where Vercel runs from)
const originalCwd = process.cwd();
console.log('Original working directory (Vercel root):', originalCwd);

// We're in web/, so go up one level to find project root
const projectRoot = path.join(__dirname, '..');
const mainBuildScript = path.join(projectRoot, 'build.js');

// Determine where to create public directory
// If we're in web/, create public in parent (project root)
// But also create it relative to originalCwd in case Vercel looks there
let publicDirLocation = projectRoot; // Default to project root
if (originalCwd.includes('web') || path.basename(originalCwd) === 'web') {
  // If Vercel runs from web/, create public in parent
  publicDirLocation = path.join(originalCwd, '..');
  console.log('Detected running from web directory, will create public in parent');
}

console.log('Project root:', projectRoot);
console.log('Looking for main build.js at:', mainBuildScript);

if (!fs.existsSync(mainBuildScript)) {
  console.error('✗ ERROR: Could not find build.js in project root');
  console.error('Project root contents:', fs.existsSync(projectRoot) ? fs.readdirSync(projectRoot) : 'Does not exist');
  process.exit(1);
}

console.log('✓ Found main build.js');
console.log('Project root:', projectRoot);
console.log('Public directory will be created at:', path.join(publicDirLocation, 'public'));
console.log('Changing to project root and running build...\n');

// Change to project root to run build
process.chdir(projectRoot);
console.log('Current directory after chdir:', process.cwd());

try {
  require(mainBuildScript);
  console.log('\n✓ Build script completed successfully');
  
  // After build, ensure public directory exists where Vercel expects it
  const publicInProjectRoot = path.join(projectRoot, 'public');
  const publicInExpectedLocation = path.join(publicDirLocation, 'public');
  
  console.log('\n=== Post-build: Ensuring public directory is in correct location ===');
  console.log(`Public in project root: ${publicInProjectRoot}`);
  console.log(`Public in expected location: ${publicInExpectedLocation}`);
  
  if (fs.existsSync(publicInProjectRoot)) {
    console.log('✓ Public directory exists in project root');
    
    // If expected location is different, copy/symlink it there
    if (publicInProjectRoot !== publicInExpectedLocation) {
      if (!fs.existsSync(publicInExpectedLocation)) {
        console.log(`Copying public directory to expected location: ${publicInExpectedLocation}`);
        
        // Copy directory function
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
        
        copyDirSync(publicInProjectRoot, publicInExpectedLocation);
        console.log('✓ Copied public directory to expected location');
      } else {
        console.log('✓ Public directory already exists in expected location');
      }
    }
    
    // Also create relative to original CWD (where Vercel might look)
    const publicRelativeToOriginal = path.join(originalCwd, '..', 'public');
    if (publicRelativeToOriginal !== publicInProjectRoot && !fs.existsSync(publicRelativeToOriginal)) {
      console.log(`Also ensuring public exists at: ${publicRelativeToOriginal}`);
      if (fs.existsSync(publicInProjectRoot)) {
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
        copyDirSync(publicInProjectRoot, publicRelativeToOriginal);
        console.log('✓ Also created public in relative location');
      }
    }
  } else {
    console.error('✗ ERROR: Public directory was not created in project root!');
    process.exit(1);
  }
  
  // Final verification - list all public directories
  console.log('\n=== Final Verification: All public directory locations ===');
  const publicDirs = [
    publicInProjectRoot,
    publicInExpectedLocation,
    path.join(originalCwd, '..', 'public'),
    'public' // Relative
  ];
  
  publicDirs.forEach(dir => {
    const absPath = path.isAbsolute(dir) ? dir : path.resolve(dir);
    if (fs.existsSync(absPath)) {
      const files = fs.readdirSync(absPath);
      console.log(`✓ ${absPath} exists with ${files.length} items`);
    } else {
      console.log(`✗ ${absPath} does not exist`);
    }
  });
  
} catch (error) {
  console.error('✗ ERROR: Build script failed:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

