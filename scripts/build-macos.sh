#!/bin/bash
# Build script for macOS (Apple Silicon and Intel)

echo "🔨 Building PhotoVideo Pro for macOS..."

# Install Rust targets for macOS
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin

# Build for Apple Silicon
echo "Building for Apple Silicon (M1/M2/M3)..."
npm run build:macos

# Build for Intel
echo "Building for Intel..."
npm run build:macos-intel

echo "✅ macOS builds complete!"
echo "Apple Silicon: src-tauri/target/aarch64-apple-darwin/release/"
echo "Intel: src-tauri/target/x86_64-apple-darwin/release/"
