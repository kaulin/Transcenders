import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  cacheDir: '.vite',
  envDir: '..',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        // Split chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  esbuild: {
    // Only include source maps in development
    sourcemap: mode === 'development',
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
