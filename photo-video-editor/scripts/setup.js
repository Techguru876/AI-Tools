/**
 * SETUP SCRIPT
 *
 * Automates initial project setup:
 * - Check for required dependencies
 * - Install npm packages
 * - Download required AI models (optional)
 * - Set up directory structure
 * - Create initial configuration files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('='.repeat(60));
console.log('Pro Photo Video Editor - Setup');
console.log('='.repeat(60));
console.log();

/**
 * Check if Node.js version is compatible
 */
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));

  console.log(`✓ Node.js version: ${version}`);

  if (major < 16) {
    console.error('✗ Node.js 16 or higher is required');
    process.exit(1);
  }
}

/**
 * Check for FFmpeg installation
 */
function checkFFmpeg() {
  try {
    const version = execSync('ffmpeg -version', { encoding: 'utf-8' });
    console.log('✓ FFmpeg is installed');
  } catch {
    console.warn('⚠ FFmpeg not found. Video processing features will be limited.');
    console.warn('  Install FFmpeg from: https://ffmpeg.org/download.html');
  }
}

/**
 * Create required directories
 */
function createDirectories() {
  const dirs = [
    'temp',
    'temp/images',
    'temp/audio',
    'temp/export',
    'projects',
    'projects/templates',
    'projects/autosave',
    'models',
    'assets',
  ];

  console.log('\nCreating directory structure...');

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}/`);
    } else {
      console.log(`  - ${dir}/ already exists`);
    }
  });
}

/**
 * Install npm dependencies
 */
function installDependencies() {
  console.log('\nInstalling dependencies...');
  console.log('This may take a few minutes...\n');

  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✓ Dependencies installed successfully');
  } catch (error) {
    console.error('\n✗ Failed to install dependencies');
    console.error('Please run "npm install" manually');
    process.exit(1);
  }
}

/**
 * Create .gitignore file
 */
function createGitignore() {
  const gitignoreContent = `# Dependencies
node_modules/
package-lock.json

# Build output
dist/
build/
release/

# Temporary files
temp/
*.tmp

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# AI Models (optional - too large for git)
models/*
!models/.gitkeep

# Projects and autosave
projects/autosave/
`;

  const gitignorePath = path.join(process.cwd(), '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✓ Created .gitignore');
  }
}

/**
 * Create README with quick start guide
 */
function createReadme() {
  const readmePath = path.join(process.cwd(), 'README.md');

  if (fs.existsSync(readmePath)) {
    console.log('- README.md already exists');
    return;
  }

  const readmeContent = `# Pro Photo Video Editor

Professional cross-platform photo and video editing application.

## Quick Start

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:windows
npm run build:mac
npm run build:all
\`\`\`

## Features

- Multi-track video editing
- Layer-based image editing
- AI-powered tools
- Professional color grading
- Audio mixing
- Export presets for all major platforms

## Documentation

See \`docs/\` directory for comprehensive documentation.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('✓ Created README.md');
}

/**
 * Display next steps
 */
function displayNextSteps() {
  console.log('\n' + '='.repeat(60));
  console.log('Setup Complete!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('  1. npm run dev       - Start development server');
  console.log('  2. npm run build     - Build for production');
  console.log('  3. Read docs/        - Learn about features and API');
  console.log('\nOptional:');
  console.log('  - Install FFmpeg for full video processing support');
  console.log('  - Download AI models for enhanced features');
  console.log('\nHappy editing!');
  console.log();
}

/**
 * Main setup function
 */
function main() {
  try {
    checkNodeVersion();
    checkFFmpeg();
    createDirectories();
    createGitignore();
    createReadme();

    // Ask user if they want to install dependencies
    console.log('\nWould you like to install npm dependencies now? (recommended)');
    console.log('You can also run "npm install" manually later.');

    // For automated setup, always install
    installDependencies();

    displayNextSteps();
  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
main();
