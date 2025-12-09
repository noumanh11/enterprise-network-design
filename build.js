// Simple build script to prepare files for Vercel
const fs = require('fs');
const path = require('path');

console.log('=== Vercel Build Script ===');
console.log('Current working directory:', process.cwd());
console.log('Script directory (__dirname):', __dirname);

// Use process.cwd() to ensure we're in the project root
// Vercel runs builds from the project root
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');

console.log('Project root:', projectRoot);
console.log('Public directory will be:', publicDir);
console.log('');

// Create public directory if it doesn't exist
try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Created public directory');
  } else {
    // Clean existing public directory
    console.log('Cleaning existing public directory...');
    if (fs.existsSync(publicDir)) {
      fs.rmSync(publicDir, { recursive: true, force: true });
      fs.mkdirSync(publicDir, { recursive: true });
    }
  }
  console.log(`Public directory: ${publicDir}`);
} catch (error) {
  console.error('Error creating public directory:', error);
  process.exit(1);
}

// Copy web files to public
const webDir = path.join(projectRoot, 'web');
console.log('Web directory:', webDir);
const filesToCopy = ['script.js', 'styles.css', 'vlsm-tree-complete.mmd', 'vlsm_data.txt'];

filesToCopy.forEach(file => {
  const src = path.join(webDir, file);
  const dest = path.join(publicDir, file);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠ File not found: ${src}`);
    }
  } catch (error) {
    console.error(`✗ Error copying ${file}:`, error.message);
    process.exit(1);
  }
});

// Copy and update index.html paths
const indexSrc = path.join(webDir, 'index.html');
const indexDest = path.join(publicDir, 'index.html');
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
  } else {
    console.error(`✗ index.html not found at: ${indexSrc}`);
    process.exit(1);
  }
} catch (error) {
  console.error('✗ Error processing index.html:', error.message);
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
    console.warn('⚠ Results directory not found');
  }
} catch (error) {
  console.error('✗ Error copying results directory:', error.message);
  process.exit(1);
}

// Copy configured_topology_snapshots
const snapshotsSrc = path.join(projectRoot, 'configured_topology_snapshots');
const snapshotsDest = path.join(publicDir, 'configured_topology_snapshots');
try {
  if (fs.existsSync(snapshotsSrc)) {
    copyDirSync(snapshotsSrc, snapshotsDest);
    console.log('✓ Copied configured_topology_snapshots directory');
  } else {
    console.warn('⚠ configured_topology_snapshots directory not found');
  }
} catch (error) {
  console.error('✗ Error copying configured_topology_snapshots:', error.message);
  process.exit(1);
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
    process.exit(1);
  }
  
  const publicFiles = fs.readdirSync(publicDir);
  if (publicFiles.length === 0) {
    console.error('✗ ERROR: Public directory is empty!');
    process.exit(1);
  }
  
  console.log(`\n✓ Build complete! Public directory contains ${publicFiles.length} items:`);
  publicFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      console.log(`  📁 ${file}/`);
    } else {
      console.log(`  📄 ${file}`);
    }
  });
  
  // Verify index.html exists
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('✗ ERROR: index.html not found in public directory!');
    process.exit(1);
  }
  
  // Create a marker file to verify build completed
  const markerFile = path.join(publicDir, '.vercel-build-complete');
  fs.writeFileSync(markerFile, `Build completed at: ${new Date().toISOString()}\n`);
  console.log('✓ Created build marker file');
  
  console.log('\n✓ All files copied successfully. Ready for deployment!');
  console.log(`✓ Public directory verified at: ${publicDir}`);
  
  // Final verification - list directory contents
  const finalCheck = fs.readdirSync(publicDir);
  console.log(`✓ Final verification: ${finalCheck.length} items in public directory`);
  
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

