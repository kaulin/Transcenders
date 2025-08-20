import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: '.vite',
  envDir: '..',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
});
