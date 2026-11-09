import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': { target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5277', changeOrigin: true },
      '/swagger': { target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5277', changeOrigin: true },
    },
  },
});
