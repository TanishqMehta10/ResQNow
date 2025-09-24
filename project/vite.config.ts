import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    host: true,
    port: 4173, // optional, can leave default
    allowedHosts: ['resqnow.onrender.com'] // <-- add your Render URL here
  }
});
