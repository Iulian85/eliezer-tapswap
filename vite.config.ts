import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths for assets
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});