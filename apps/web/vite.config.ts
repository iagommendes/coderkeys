import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'CoderKeys',
        short_name: 'CoderKeys',
        description: 'Typing tutor for programmers and technical writers',
        theme_color: '#0f1419',
        background_color: '#0f1419',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3_000_000,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@coderkeys/engine',
        replacement: path.resolve(rootDir, '../../packages/engine/src/index.ts'),
      },
      {
        find: '@coderkeys/schemas',
        replacement: path.resolve(rootDir, '../../packages/schemas/src/index.ts'),
      },
      {
        find: '@content',
        replacement: path.resolve(rootDir, '../../content'),
      },
      { find: '@', replacement: path.resolve(rootDir, 'src') },
    ],
  },
  server: {
    host: true,
    fs: {
      allow: ['..', '../..'],
    },
  },
});
