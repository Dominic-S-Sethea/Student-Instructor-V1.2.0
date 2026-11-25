import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist/public',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/');
            if (normalized.includes('/node_modules/')) {
              if (normalized.includes('/react/') || normalized.includes('/react-dom/')) {
                return 'vendor-react';
              }
              if (normalized.includes('/motion/') || normalized.includes('/framer-motion/')) {
                return 'vendor-motion';
              }
              if (normalized.includes('/react-markdown/') || normalized.includes('/remark') || normalized.includes('/unified')) {
                return 'vendor-markdown';
              }
              if (normalized.includes('/firebase/') || normalized.includes('/@firebase/')) {
                return 'vendor-firebase';
              }
              if (normalized.includes('/lucide-react/')) {
                return 'vendor-icons';
              }
            }
            if (normalized.includes('/shared/data/topUniversities/')) {
              return 'data-top-universities';
            }
            if (normalized.includes('/shared/data/university')) {
              return 'data-cambodia-universities';
            }
            if (normalized.includes('/shared/data/scholarshipData')) {
              return 'data-scholarships';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
