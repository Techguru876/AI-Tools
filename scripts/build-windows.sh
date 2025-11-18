#!/bin/bash
# Build script for Windows (x86_64)

echo "🔨 Building PhotoVideo Pro for Windows..."

# Install Rust target for Windows
rustup target add x86_64-pc-windows-msvc

# Build the application
npm run build:windows

echo "✅ Windows build complete!"
echo "Output: src-tauri/target/release/photovideo-pro.exe"
