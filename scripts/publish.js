#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist';

console.log('📦 Starting npm publish process...');

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Dist directory not found. Run build first.');
  process.exit(1);
}

// Check if package.json exists in dist
const distPackageJson = path.join(DIST_DIR, 'package.json');
if (!fs.existsSync(distPackageJson)) {
  console.error('❌ package.json not found in dist directory');
  process.exit(1);
}

// Read package info
const packageInfo = JSON.parse(fs.readFileSync(distPackageJson, 'utf8'));
console.log(`📋 Package: ${packageInfo.name}@${packageInfo.version}`);

// Check npm authentication
try {
  const whoami = execSync('npm whoami', { stdio: 'pipe', cwd: DIST_DIR }).toString().trim();
  console.log(`👤 Logged in as: ${whoami}`);
} catch (error) {
  console.error('❌ Not logged in to npm. Please run: npm login');
  process.exit(1);
}

// Check if version already exists
try {
  const existingVersions = execSync(`npm view ${packageInfo.name} versions --json`, { 
    stdio: 'pipe' 
  }).toString();
  
  const versions = JSON.parse(existingVersions);
  if (versions.includes(packageInfo.version)) {
    console.error(`❌ Version ${packageInfo.version} already exists on npm`);
    console.log('💡 Update version in package.json or use npm version patch/minor/major');
    process.exit(1);
  }
} catch (error) {
  // Package might not exist yet, which is fine
  console.log('📦 New package or unable to check existing versions');
}

// Dry run first
console.log('🧪 Running publish dry-run...');
try {
  const dryRunOutput = execSync('npm publish --dry-run --access public', { 
    cwd: DIST_DIR,
    stdio: 'pipe' 
  }).toString();
  
  console.log('✅ Dry-run successful');
  
  // Show what would be published
  const lines = dryRunOutput.split('\n');
  const tarballLine = lines.find(line => line.includes('tarball:'));
  if (tarballLine) {
    console.log(`📁 ${tarballLine.trim()}`);
  }
  
  const sizeLine = lines.find(line => line.includes('unpacked size:'));
  if (sizeLine) {
    console.log(`📏 ${sizeLine.trim()}`);
  }
  
} catch (error) {
  console.error('❌ Dry-run failed:', error.message);
  process.exit(1);
}

// Confirm publication
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// In CI environment, skip confirmation
if (process.env.CI || process.env.NODE_AUTH_TOKEN) {
  console.log('🤖 CI environment detected, proceeding with publish...');
  publishPackage();
} else {
  rl.question('🚀 Proceed with publishing? (y/N): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      publishPackage();
    } else {
      console.log('❌ Publish cancelled');
      process.exit(0);
    }
  });
}

function publishPackage() {
  try {
    console.log('🚀 Publishing to npm...');
    
    const publishCommand = 'npm publish --access public';
    const result = execSync(publishCommand, { 
      cwd: DIST_DIR,
      stdio: 'inherit' 
    });
    
    console.log('🎉 Successfully published to npm!');
    console.log(`📦 ${packageInfo.name}@${packageInfo.version} is now available`);
    
  } catch (error) {
    console.error('❌ Publish failed:', error.message);
    process.exit(1);
  }
}