import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LessonSchema, ManifestSchema } from '@coderkeys/schemas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content');

async function collectJsonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsonFiles(fullPath)));
    } else if (entry.name.endsWith('.json') && entry.name !== 'manifest.json') {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const manifestPath = path.join(contentDir, 'manifest.json');
  const manifestRaw = JSON.parse(await readFile(manifestPath, 'utf-8'));
  ManifestSchema.parse(manifestRaw);

  const lessonFiles = (await collectJsonFiles(path.join(contentDir, 'tracks'))).filter(
    (f) => !f.endsWith('_meta.json'),
  );

  const ids = new Set<string>();
  let count = 0;

  for (const file of lessonFiles) {
    const raw = JSON.parse(await readFile(file, 'utf-8'));
    const lesson = LessonSchema.parse(raw);

    const localeFromPath = file.split(`${path.sep}tracks${path.sep}`)[1]?.split(path.sep)[1];
    if (localeFromPath && lesson.locale !== localeFromPath) {
      throw new Error(`Locale mismatch in ${file}: expected ${localeFromPath}, got ${lesson.locale}`);
    }

    const key = `${lesson.track}/${lesson.module}/${lesson.locale}/${lesson.id}`;
    if (ids.has(key)) {
      throw new Error(`Duplicate lesson id: ${key}`);
    }
    ids.add(key);
    count++;
  }

  console.log(`✓ Manifest valid`);
  console.log(`✓ ${count} lessons validated`);
}

main().catch((err) => {
  console.error('Content validation failed:', err);
  process.exit(1);
});
