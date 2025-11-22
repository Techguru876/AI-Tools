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
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: ['es2021', 'chrome120'],
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
  },
})
