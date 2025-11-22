import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_'],
  resolve: {
    alias: {
      // Stub out legacy Tauri imports (PhotoVideo Pro is disabled)
      '@tauri-apps/api/tauri': '/src/stubs/tauri.ts',
      '@tauri-apps/api/dialog': '/src/stubs/tauri.ts',
      '@ffmpeg/ffmpeg': '/src/stubs/ffmpeg.ts',
      '@ffmpeg/util': '/src/stubs/ffmpeg.ts',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: ['es2021', 'chrome120'],
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
  },
})
