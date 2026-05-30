import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // لتقليل حجم الملفات وزيادة الأداء
    minify: 'terser', // استخدام Terser لضغط الملفات بأعلى كفاءة
    terserOptions: {
      compress: {
        drop_console: true, // إزالة أي رسائل console.log من المتجر النهائي
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // تقسيم الملفات الكبيرة لتحسين سرعة التحميل
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
