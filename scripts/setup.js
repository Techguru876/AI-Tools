/**
 * Setup Script
 * Initializes the development environment and creates necessary directories
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ContentForge Studio - Setup Script\n');

// Create necessary directories
const directories = [
  'src-tauri/icons',
  'dist',
  'cache',
  'proxies',
  'temp',
  'exports',
];

console.log('Creating directories...');
directories.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✓ Created ${dir}`);
  } else {
    console.log(`  ○ ${dir} already exists`);
  }
});

// Create placeholder icon files
console.log('\nCreating placeholder icons...');
const iconSizes = ['32x32', '128x128', '128x128@2x'];
iconSizes.forEach((size) => {
  const iconPath = path.join(__dirname, '..', 'src-tauri', 'icons', `${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // In a real implementation, generate actual icon files
    fs.writeFileSync(iconPath, '');
    console.log(`  ✓ Created ${size}.png`);
  }
});

console.log('\n✅ Setup complete!\n');
console.log('Next steps:');
console.log('  1. npm install          - Install dependencies');
console.log('  2. npm run dev          - Start development server');
console.log('  3. npm run build        - Build for production');
console.log('');
