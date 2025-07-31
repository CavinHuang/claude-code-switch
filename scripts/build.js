#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist';
const SRC_DIR = 'src';
const BIN_DIR = 'bin';

console.log('🚀 Starting build process...');

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  console.log('✅ Cleaned existing dist directory');
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy source files
console.log('📂 Copying source files...');
copyDirectory(SRC_DIR, path.join(DIST_DIR, SRC_DIR));

// Copy and fix bin directory
if (fs.existsSync(BIN_DIR)) {
  copyDirectory(BIN_DIR, path.join(DIST_DIR, BIN_DIR));
  
  // Fix the require path in bin files
  const binFiles = fs.readdirSync(path.join(DIST_DIR, BIN_DIR));
  binFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(DIST_DIR, BIN_DIR, file);
      let content = fs.readFileSync(filePath, 'utf8');
      // Change '../src/index.js' to './src/index.js' for dist structure
      content = content.replace("require('../src/index.js');", "require('./src/index.js');");
      fs.writeFileSync(filePath, content);
    }
  });
  
  console.log('✅ Copied and fixed bin directory');
}

// Copy essential files
const essentialFiles = ['LICENSE', 'README.md', 'CHANGELOG.md'];
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(DIST_DIR, file));
    console.log(`✅ Copied ${file}`);
  }
});

// Create distribution package.json
console.log('📝 Creating distribution package.json...');
createDistPackageJson();

console.log('✅ Build process completed!');

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createDistPackageJson() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Update paths for distribution
  packageJson.main = 'src/index.js';
  if (packageJson.bin) {
    Object.keys(packageJson.bin).forEach(key => {
      packageJson.bin[key] = packageJson.bin[key].replace('./bin/', './bin/');
    });
  }
  
  // Update files array for distribution
  packageJson.files = [
    'src/',
    'bin/',
    'LICENSE',
    'README.md',
    'CHANGELOG.md'
  ];
  
  // Remove dev dependencies and scripts not needed in distribution
  delete packageJson.devDependencies;
  const keepScripts = ['start'];
  if (packageJson.scripts) {
    packageJson.scripts = Object.keys(packageJson.scripts)
      .filter(key => keepScripts.includes(key))
      .reduce((obj, key) => {
        obj[key] = packageJson.scripts[key];
        return obj;
      }, {});
  }
  
  fs.writeFileSync(
    path.join(DIST_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}