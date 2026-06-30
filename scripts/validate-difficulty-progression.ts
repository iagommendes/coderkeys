import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LessonSchema, ManifestSchema, type Lesson } from '@coderkeys/schemas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content');

/** Suggested minWpm by difficulty level (1–5). */
const SUGGESTED_MIN_WPM: Record<number, number> = {
  1: 25,
  2: 30,
  3: 35,
  4: 40,
  5: 45,
};

type ProgressionIssue = {
  kind: 'regression' | 'minWpm';
  track: string;
  module: string;
  locale: string;
  lessonId: string;
  message: string;
};

async function loadLesson(track: string, locale: string, module: string, slug: string): Promise<Lesson> {
  const filePath = path.join(contentDir, 'tracks', track, locale, module, `${slug}.json`);
  const raw = JSON.parse(await readFile(filePath, 'utf-8'));
  return LessonSchema.parse(raw);
}

async function main() {
  const manifestPath = path.join(contentDir, 'manifest.json');
  const manifest = ManifestSchema.parse(JSON.parse(await readFile(manifestPath, 'utf-8')));

  const issues: ProgressionIssue[] = [];
  let modulesChecked = 0;

  for (const track of manifest.tracks) {
    for (const mod of track.modules) {
      for (const [locale, slugs] of Object.entries(mod.lessons)) {
        if (slugs.length === 0) continue;

        modulesChecked++;
        let prevDifficulty: number | null = null;
        let prevSlug: string | null = null;

        for (const slug of slugs) {
          const lesson = await loadLesson(track.id, locale, mod.id, slug);

          if (prevDifficulty !== null && lesson.difficulty < prevDifficulty) {
            issues.push({
              kind: 'regression',
              track: track.id,
              module: mod.id,
              locale,
              lessonId: lesson.id,
              message: `${slug} (difficulty ${lesson.difficulty}) is easier than ${prevSlug} (difficulty ${prevDifficulty})`,
            });
          }

          const suggested = SUGGESTED_MIN_WPM[lesson.difficulty];
          const actual = lesson.goals?.minWpm;
          if (actual !== undefined && actual < suggested) {
            issues.push({
              kind: 'minWpm',
              track: track.id,
              module: mod.id,
              locale,
              lessonId: lesson.id,
              message: `${slug} minWpm ${actual} is below suggested ${suggested} for difficulty ${lesson.difficulty}`,
            });
          }

          prevDifficulty = lesson.difficulty;
          prevSlug = slug;
        }
      }
    }
  }

  const regressions = issues.filter((i) => i.kind === 'regression');
  const minWpmWarnings = issues.filter((i) => i.kind === 'minWpm');

  if (regressions.length > 0) {
    console.error('✗ Difficulty regressions found:\n');
    for (const issue of regressions) {
      console.error(`  [${issue.track}/${issue.module}/${issue.locale}] ${issue.message}`);
    }
    process.exit(1);
  }

  console.log(`✓ ${modulesChecked} module/locale sequences checked — no difficulty regressions`);

  if (minWpmWarnings.length > 0) {
    console.warn(`\n⚠ ${minWpmWarnings.length} minWpm suggestions (non-blocking):\n`);
    for (const issue of minWpmWarnings) {
      console.warn(`  [${issue.track}/${issue.module}/${issue.locale}] ${issue.message}`);
    }
  } else {
    console.log('✓ All minWpm goals meet suggested thresholds');
  }
}

main().catch((err) => {
  console.error('Difficulty validation failed:', err);
  process.exit(1);
});
