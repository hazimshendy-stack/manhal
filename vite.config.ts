import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    // مهم: hash في أسماء الملفات عشان كل build يبقى مختلف
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash]-mubumven-oldswy.js',
        chunkFileNames: 'assets/[name]-[hash]-mubumven-oldswy.js',
        assetFileNames: 'assets/[name]-[hash]-mubumven-oldswy[extname]',
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
