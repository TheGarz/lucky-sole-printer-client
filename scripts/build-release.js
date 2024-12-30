const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure we're in the project root
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

console.log('🚀 Building Lucky Sole Printer Client...\n');

try {
    // Clean previous builds
    console.log('Cleaning previous builds...');
    execSync('rm -rf dist');
    execSync('rm -rf release');

    // Install dependencies
    console.log('\nInstalling dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Convert icons
    console.log('\nConverting icons...');
    execSync('npm run icons', { stdio: 'inherit' });

    // Build TypeScript
    console.log('\nCompiling TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });

    // Package application
    console.log('\nPackaging application...');
    execSync('npm run package', { stdio: 'inherit' });

    console.log('\n✅ Build completed successfully!');
    console.log('\nInstaller can be found in:');
    console.log('release/LuckySolePrinterClient-Setup.exe');
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
} 