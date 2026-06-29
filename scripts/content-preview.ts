import { execSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LessonSchema } from '@coderkeys/schemas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content');

async function collectLessonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectLessonFiles(fullPath)));
    } else if (entry.name.endsWith('.json') && !entry.name.endsWith('_meta.json') && entry.name !== 'manifest.json') {
      files.push(fullPath);
    }
  }

  return files;
}

function getChangedContentFiles(): string[] {
  const base = process.env.GITHUB_BASE_REF;
  if (!base) return [];

  try {
    const output = execSync(`git diff --name-only origin/${base}...HEAD -- content/`, {
      encoding: 'utf-8',
      cwd: root,
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('content/') && line.endsWith('.json'));
  } catch {
    return [];
  }
}

async function summarizeLesson(filePath: string) {
  const raw = JSON.parse(await readFile(path.join(root, filePath), 'utf-8'));
  const lesson = LessonSchema.parse(raw);
  const preview = lesson.content.text.slice(0, 80).replace(/\n/g, ' ');
  return `| \`${lesson.id}\` | ${lesson.track} | ${lesson.locale} | ${lesson.difficulty} | ${preview}${lesson.content.text.length > 80 ? '…' : ''} |`;
}

async function main() {
  const changed = getChangedContentFiles();
  const allLessons = await collectLessonFiles(path.join(contentDir, 'tracks'));

  console.log('## CoderKeys content preview\n');
  console.log(`Total lessons in repo: **${allLessons.length}**\n`);

  if (changed.length === 0) {
    console.log('_No content file changes detected in this PR (or not running in PR context)._\n');
    return;
  }

  console.log(`Changed content files: **${changed.length}**\n`);

  const lessonFiles = changed.filter(
    (f) => f.includes('/tracks/') && !f.endsWith('_meta.json') && !f.endsWith('manifest.json'),
  );

  if (lessonFiles.length > 0) {
    console.log('### Lessons in this PR\n');
    console.log('| ID | Track | Locale | Difficulty | Preview |');
    console.log('|----|-------|--------|------------|---------|');
    for (const file of lessonFiles) {
      console.log(await summarizeLesson(file));
    }
    console.log('');
  }

  const metaFiles = changed.filter((f) => f.endsWith('_meta.json') || f.endsWith('manifest.json'));
  if (metaFiles.length > 0) {
    console.log('### Metadata changes\n');
    for (const file of metaFiles) {
      console.log(`- \`${file}\``);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
