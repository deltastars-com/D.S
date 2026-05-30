import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // هذا هو المحرك الرسمي لـ v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // سيعالج الـ CSS تلقائياً ولا يحتاج PostCSS
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
