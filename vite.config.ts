import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['sharp'] // تجاهل sharp في البناء لأنه يتم تحميله وقت التشغيل
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
