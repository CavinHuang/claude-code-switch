#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist';

console.log('🔒 Starting code obfuscation...');

// Check if javascript-obfuscator is available
try {
  execSync('npx javascript-obfuscator --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ javascript-obfuscator not found. Installing...');
  execSync('npm install --no-save javascript-obfuscator', { stdio: 'inherit' });
}

// Find all JS files in dist directory
const jsFiles = findJSFiles(DIST_DIR);

if (jsFiles.length === 0) {
  console.log('⚠️  No JavaScript files found to obfuscate');
  process.exit(0);
}

console.log(`📁 Found ${jsFiles.length} JavaScript files to obfuscate`);

// Obfuscation options
const obfuscateOptions = [
  '--compact true',
  '--control-flow-flattening true',
  '--control-flow-flattening-threshold 0.75',
  '--dead-code-injection true',
  '--dead-code-injection-threshold 0.4',
  '--debug-protection false',
  '--disable-console-output false',
  '--identifier-names-generator hexadecimal',
  '--log false',
  '--rename-globals false',
  '--self-defending true',
  '--string-array true',
  '--string-array-encoding base64',
  '--string-array-threshold 0.75',
  '--transform-object-keys true',
  '--unicode-escape-sequence false'
].join(' ');

// Obfuscate each file
let successCount = 0;
for (const file of jsFiles) {
  try {
    console.log(`🔒 Obfuscating: ${file}`);
    const command = `npx javascript-obfuscator "${file}" --output "${file}" ${obfuscateOptions}`;
    execSync(command, { stdio: 'pipe' });
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to obfuscate ${file}:`, error.message);
  }
}

console.log(`✅ Successfully obfuscated ${successCount}/${jsFiles.length} files`);

// Test the obfuscated code
console.log('🧪 Testing obfuscated code...');
try {
  const testResult = execSync(`node ${path.join(DIST_DIR, 'src', 'index.js')} --help`, { 
    stdio: 'pipe',
    timeout: 5000 
  });
  console.log('✅ Obfuscated code test passed');
} catch (error) {
  console.warn('⚠️  Obfuscated code test failed, but continuing...');
}

console.log('🎉 Obfuscation process completed!');

function findJSFiles(dir) {
  const jsFiles = [];
  
  if (!fs.existsSync(dir)) {
    return jsFiles;
  }
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.js') {
        jsFiles.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return jsFiles;
}