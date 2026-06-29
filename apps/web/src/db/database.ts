import Dexie, { type EntityTable } from 'dexie';
import type { BuiltInThemeId, Locale } from '@coderkeys/schemas';

export interface UserSettings {
  id: 'default';
  uiLocale: Locale;
  contentLocale: Locale;
  theme: 'light' | 'dark' | 'system';
  colorTheme: BuiltInThemeId;
  strictMode: boolean;
  soundEnabled: boolean;
}

export interface LessonProgress {
  lessonId: string;
  track: string;
  module: string;
  bestWpm: number;
  bestAccuracy: number;
  bestAwpm: number;
  attempts: number;
  completed: boolean;
  lastPlayedAt: string;
}

export interface SessionRecord {
  id: string;
  lessonId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  awpm: number;
  durationMs: number;
  errorPositions: number[];
  errorChars: string[];
  completedAt: string;
}

export class CoderKeysDatabase extends Dexie {
  settings!: EntityTable<UserSettings, 'id'>;
  lessonProgress!: EntityTable<LessonProgress, 'lessonId'>;
  sessions!: EntityTable<SessionRecord, 'id'>;

  constructor() {
    super('coderkeys');

    this.version(1).stores({
      settings: 'id',
      lessonProgress: 'lessonId, track, module, lastPlayedAt',
      sessions: 'id, lessonId, completedAt',
    });

    this.version(2)
      .stores({
        settings: 'id',
        lessonProgress: 'lessonId, track, module, lastPlayedAt',
        sessions: 'id, lessonId, completedAt',
      })
      .upgrade(async (tx) => {
        const settings = await tx.table('settings').get('default');
        if (settings && !settings.colorTheme) {
          await tx.table('settings').put({
            ...settings,
            colorTheme: 'default-dark',
          });
        }
      });
  }
}

export const db = new CoderKeysDatabase();

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'default',
  uiLocale: 'en-US',
  contentLocale: 'en-US',
  theme: 'dark',
  colorTheme: 'default-dark',
  strictMode: false,
  soundEnabled: false,
};
