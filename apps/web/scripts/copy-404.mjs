import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const index = path.join(dist, 'index.html');

if (existsSync(index)) {
  copyFileSync(index, path.join(dist, '404.html'));
  console.log('✓ Copied index.html → 404.html for SPA routing on GitHub Pages');
}
