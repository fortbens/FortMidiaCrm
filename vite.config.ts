import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  let outDir = 'dist';
  // Relative './' base ensures the single build works cleanly on domain roots
  // (fortmidia.com.br, fortnews.com.br) and cPanel subfolders. Override via VITE_BASE_PATH='/' if needed.
  const basePath = process.env.VITE_BASE_PATH || './';

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        configResolved(resolved) {
          outDir = resolved.build.outDir || 'dist';
        },
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, outDir);
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    define: {
      'import.meta.env.VITE_APP_ENV': JSON.stringify(
        process.env.VITE_APP_ENV || (mode === 'production' ? 'production' : 'development')
      ),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        process.env.VITE_API_BASE_URL || '/api'
      ),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
        process.env.VITE_GOOGLE_MAPS_API_KEY || ''
      ),
      'import.meta.env.VITE_APP_TARGET': JSON.stringify(
        process.env.VITE_APP_TARGET || 'all'
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
