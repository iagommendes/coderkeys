import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const base = isGitHubPages ? '/coderkeys/' : '/';

export default defineConfig({
  base,
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
        start_url: base,
        icons: [
          {
            src: `${base}favicon.svg`,
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'recharts';
          }
          if (id.includes('node_modules/@codemirror')) {
            return 'codemirror';
          }
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }
        },
      },
    },
  },
  server: {
    host: true,
    fs: {
      allow: ['..', '../..'],
    },
  },
});
