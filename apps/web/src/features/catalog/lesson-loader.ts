import manifest from '@content/manifest.json';
import { LessonSchema, ManifestSchema, TrackMetaSchema, type Lesson, type Locale, type Manifest } from '@coderkeys/schemas';

const lessonModules = import.meta.glob<{ default: Lesson }>('@content/tracks/**/*.json', {
  eager: true,
});

const trackMetaModules = import.meta.glob<{ default: Record<string, string> & { id: string } }>(
  '@content/tracks/*/_meta.json',
  { eager: true },
);

export interface LessonRef {
  lessonId: string;
  trackId: string;
  moduleId: string;
  locale: Locale;
  fileSlug: string;
}

export interface TrackMetaView {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  defaultModule: string;
}

function parseLessonPath(path: string): LessonRef | null {
  const match = path.match(/tracks\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)\.json$/);
  if (!match) return null;

  const [, trackId, locale, moduleId, fileSlug] = match;
  if (locale !== 'en-US' && locale !== 'pt-BR') return null;

  return {
    lessonId: `${trackId}/${moduleId}/${locale}/${fileSlug}`,
    trackId,
    moduleId,
    locale,
    fileSlug,
  };
}

export function getManifest(): Manifest {
  return ManifestSchema.parse(manifest);
}

export function getTrackMeta(trackId: string): TrackMetaView | null {
  const entry = Object.entries(trackMetaModules).find(([path]) => path.includes(`/tracks/${trackId}/`));
  if (!entry) return null;
  return TrackMetaSchema.parse(entry[1].default) as TrackMetaView;
}

export function getAllLessons(): Lesson[] {
  return Object.entries(lessonModules)
    .filter(([path]) => !path.includes('_meta.json'))
    .map(([, mod]) => LessonSchema.parse(mod.default));
}

export function getLessonById(lessonId: string): Lesson | null {
  const entry = Object.entries(lessonModules)
    .filter(([path]) => !path.includes('_meta.json'))
    .find(([path]) => {
      const ref = parseLessonPath(path);
      return ref?.lessonId === lessonId;
    });

  if (!entry) return null;
  return LessonSchema.parse(entry[1].default);
}

export function getLessonsForTrack(trackId: string, locale: Locale): Lesson[] {
  return getAllLessons().filter((l) => l.track === trackId && l.locale === locale);
}

export function getLessonsForModule(trackId: string, moduleId: string, locale: Locale): Lesson[] {
  return getAllLessons().filter(
    (l) => l.track === trackId && l.module === moduleId && l.locale === locale,
  );
}

export function buildLessonId(trackId: string, moduleId: string, locale: Locale, fileSlug: string): string {
  return `${trackId}/${moduleId}/${locale}/${fileSlug}`;
}

export function getLessonCandidates(locale: Locale) {
  return getAllLessons()
    .filter((l) => l.locale === locale)
    .map((l) => ({
      lessonId: buildLessonId(l.track, l.module, l.locale, l.id),
      title: l.title,
      skills: l.skills,
      difficulty: l.difficulty,
      keyboardHints: l.hints?.keyboard,
      track: l.track,
      module: l.module,
    }));
}
