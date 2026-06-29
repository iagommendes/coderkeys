import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, '../../content'),
      '@coderkeys/engine': path.resolve(__dirname, '../../packages/engine/src/index.ts'),
      '@coderkeys/schemas': path.resolve(__dirname, '../../packages/schemas/src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
});
