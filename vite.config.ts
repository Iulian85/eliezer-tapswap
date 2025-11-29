import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',                                     // OBLIGATORIU așa pentru Telegram
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      '.up.railway.app',                         // permite orice proiect Railway
      'localhost',
      '127.0.0.1',
    ],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});