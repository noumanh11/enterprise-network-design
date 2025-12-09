// Simple build script to prepare files for Vercel
const fs = require('fs');
const path = require('path');

console.log('=== Vercel Build Script ===');
console.log('Current working directory:', process.cwd());
console.log('Script directory (__dirname):', __dirname);

// Determine project root - try multiple methods for compatibility
// First, try to find the project root by looking for package.json or vercel.json
let projectRoot = process.cwd();
const scriptDir = __dirname;

// Check if we're in the right directory (has package.json and build.js)
const hasPackageJson = fs.existsSync(path.join(scriptDir, 'package.json'));
const hasVercelJson = fs.existsSync(path.join(scriptDir, 'vercel.json'));

if (hasPackageJson && hasVercelJson) {
  // We're in the project root
  projectRoot = scriptDir;
} else {
  // Try going up one level (in case we're in a subdirectory)
  const parentDir = path.dirname(scriptDir);
  if (fs.existsSync(path.join(parentDir, 'package.json')) && fs.existsSync(path.join(parentDir, 'vercel.json'))) {
    projectRoot = parentDir;
  }
  // Otherwise use process.cwd() as fallback
}

const publicDir = path.join(projectRoot, 'public');

console.log('Project root:', projectRoot);
console.log('Public directory will be:', publicDir);
console.log('');

// Verify web directory exists
const webDir = path.join(projectRoot, 'web');
if (!fs.existsSync(webDir)) {
  console.error('✗ CRITICAL ERROR: web/ directory not found!');
  console.error('Current directory contents:', fs.readdirSync(projectRoot));
  process.exit(1);
}
console.log('✓ Web directory exists:', webDir);

// Verify index.html exists in web directory
const indexCheck = path.join(webDir, 'index.html');
if (!fs.existsSync(indexCheck)) {
  console.error('✗ CRITICAL ERROR: web/index.html not found!');
  console.error('Web directory contents:', fs.readdirSync(webDir));
  process.exit(1);
}
console.log('✓ web/index.html exists');

// Create public directory if it doesn't exist
try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Created public directory');
  } else {
    // Clean existing public directory - use compatible method
    console.log('Cleaning existing public directory...');
    if (fs.existsSync(publicDir)) {
      // Use recursive delete function that works on all Node versions
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
      deleteDir(publicDir);
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('Cleaned and recreated public directory');
    }
  }
  console.log(`Public directory: ${publicDir}`);
} catch (error) {
  console.error('Error creating public directory:', error);
  console.error('Error details:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Copy web files to public
// (webDir already defined above)
const filesToCopy = ['script.js', 'styles.css', 'vlsm-tree-complete.mmd', 'vlsm_data.txt'];

let filesCopied = 0;
filesToCopy.forEach(file => {
  const src = path.join(webDir, file);
  const dest = path.join(publicDir, file);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${file}`);
      filesCopied++;
    } else {
      console.warn(`⚠ File not found: ${src} (skipping)`);
    }
  } catch (error) {
    console.error(`✗ Error copying ${file}:`, error.message);
    // Don't exit on individual file errors, just warn
    console.warn(`⚠ Continuing despite error with ${file}`);
  }
});
console.log(`Copied ${filesCopied} out of ${filesToCopy.length} web files`);

// Copy and update index.html paths - THIS IS CRITICAL
const indexSrc = path.join(webDir, 'index.html');
const indexDest = path.join(publicDir, 'index.html');
let indexHtmlExists = false;
try {
  if (fs.existsSync(indexSrc)) {
    let htmlContent = fs.readFileSync(indexSrc, 'utf8');
    // Replace ../results/ with results/
    htmlContent = htmlContent.replace(/\.\.\/results\//g, 'results/');
    // Replace ../configured_topology_snapshots/ with configured_topology_snapshots/
    htmlContent = htmlContent.replace(/\.\.\/configured_topology_snapshots\//g, 'configured_topology_snapshots/');
    // Replace ../ for root images (like ../Project Topology.png)
    htmlContent = htmlContent.replace(/src=["']\.\.\/([^"']+\.(png|jpg|jpeg|gif|svg|pdf))["']/g, 'src="$1"');
    fs.writeFileSync(indexDest, htmlContent);
    console.log('✓ Copied and updated index.html');
    indexHtmlExists = true;
  } else {
    console.error(`✗ CRITICAL: index.html not found at: ${indexSrc}`);
    console.error(`✗ Web directory contents:`, fs.existsSync(webDir) ? fs.readdirSync(webDir) : 'Web directory does not exist');
    // This is critical - exit if index.html is missing
    process.exit(1);
  }
} catch (error) {
  console.error('✗ CRITICAL: Error processing index.html:', error.message);
  console.error('Error name:', error.name);
  console.error('Error stack:', error.stack);
  console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  process.exit(1);
}

// Copy results directory
const resultsSrc = path.join(projectRoot, 'results');
const resultsDest = path.join(publicDir, 'results');
try {
  if (fs.existsSync(resultsSrc)) {
    copyDirSync(resultsSrc, resultsDest);
    console.log('✓ Copied results directory');
  } else {
    console.warn('⚠ Results directory not found (this is OK if you don\'t have results yet)');
  }
} catch (error) {
  console.error('✗ Error copying results directory:', error.message);
  console.warn('⚠ Continuing despite error (results directory is optional)');
  // Don't exit - results directory is optional
}

// Copy configured_topology_snapshots
const snapshotsSrc = path.join(projectRoot, 'configured_topology_snapshots');
const snapshotsDest = path.join(publicDir, 'configured_topology_snapshots');
try {
  if (fs.existsSync(snapshotsSrc)) {
    copyDirSync(snapshotsSrc, snapshotsDest);
    console.log('✓ Copied configured_topology_snapshots directory');
  } else {
    console.warn('⚠ configured_topology_snapshots directory not found (this is OK if you don\'t have snapshots yet)');
  }
} catch (error) {
  console.error('✗ Error copying configured_topology_snapshots:', error.message);
  console.warn('⚠ Continuing despite error (snapshots directory is optional)');
  // Don't exit - snapshots directory is optional
}

// Copy root images
const rootImages = ['Project Topology.png', 'other_networks_topology_lables.png', 
                   'VLSM-tree-1.png', 'VLSM-tree-2.png', 'VLSM-tree-other_networks.png'];
rootImages.forEach(img => {
  const src = path.join(projectRoot, img);
  const dest = path.join(publicDir, img);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${img}`);
    } else {
      console.warn(`⚠ Image not found: ${img}`);
    }
  } catch (error) {
    console.error(`✗ Error copying ${img}:`, error.message);
    // Don't exit on missing images, just warn
  }
});

// Verify public directory exists and has files
try {
  if (!fs.existsSync(publicDir)) {
    console.error('✗ ERROR: Public directory was not created!');
    console.error('Attempting to create it now...');
    fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(publicDir)) {
      console.error('✗ Failed to create public directory');
      process.exit(1);
    }
    console.log('✓ Public directory created');
  }
  
  const publicFiles = fs.readdirSync(publicDir);
  console.log(`\nPublic directory contains ${publicFiles.length} items`);
  
  if (publicFiles.length === 0) {
    console.error('✗ ERROR: Public directory is empty after build!');
    console.error('This should not happen. Check build logs above for errors.');
    process.exit(1);
  }
  
  console.log(`\n✓ Build complete! Public directory contains ${publicFiles.length} items:`);
  publicFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`  📁 ${file}/`);
      } else {
        console.log(`  📄 ${file}`);
      }
    } catch (err) {
      console.log(`  ⚠ ${file} (error reading stats)`);
    }
  });
  
  // Verify index.html exists - CRITICAL
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('✗ CRITICAL ERROR: index.html not found in public directory!');
    console.error('Public directory files:', publicFiles);
    process.exit(1);
  }
  console.log('✓ Verified index.html exists');
  
  // Create a marker file to verify build completed
  const markerFile = path.join(publicDir, '.vercel-build-complete');
  fs.writeFileSync(markerFile, `Build completed at: ${new Date().toISOString()}\n`);
  console.log('✓ Created build marker file');
  
  console.log('\n✓ All files copied successfully. Ready for deployment!');
  console.log(`✓ Public directory verified at: ${publicDir}`);
  console.log(`✓ Public directory absolute path: ${path.resolve(publicDir)}`);
  
  // Final verification - list directory contents
  const finalCheck = fs.readdirSync(publicDir);
  console.log(`✓ Final verification: ${finalCheck.length} items in public directory`);
  
  // CRITICAL: Verify public directory exists with absolute path
  const absolutePublicDir = path.resolve(publicDir);
  if (!fs.existsSync(absolutePublicDir)) {
    console.error(`✗ CRITICAL: Public directory does not exist at absolute path: ${absolutePublicDir}`);
    process.exit(1);
  }
  
  // List files in public directory to help debug
  console.log('\n=== Public Directory Contents (for debugging) ===');
  try {
    const files = fs.readdirSync(absolutePublicDir);
    files.forEach(file => {
      const filePath = path.join(absolutePublicDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (err) {
    console.error('Error listing public directory:', err.message);
  }
  
  console.log(`\n✓ Build completed successfully!`);
  console.log(`✓ Public directory ready at: ${absolutePublicDir}`);
  
  process.exit(0);
} catch (error) {
  console.error('✗ ERROR verifying build:', error.message);
  process.exit(1);
}

function copyDirSync(src, dest) {
  try {
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
  } catch (error) {
    throw new Error(`Failed to copy directory ${src} to ${dest}: ${error.message}`);
  }
}

