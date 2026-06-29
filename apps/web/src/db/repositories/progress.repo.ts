import type { SessionResult as EngineResult } from '@coderkeys/engine';
import { db, type LessonProgress, type SessionRecord, type UserSettings } from '../database';

export interface ProgressExport {
  version: 1;
  exportedAt: string;
  settings: UserSettings;
  lessonProgress: LessonProgress[];
  sessions: SessionRecord[];
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  return db.lessonProgress.get(lessonId);
}

export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  return db.lessonProgress.toArray();
}

export async function getAllSessions(): Promise<SessionRecord[]> {
  return db.sessions.orderBy('completedAt').reverse().toArray();
}

export async function getSessionsSince(days: number): Promise<SessionRecord[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return db.sessions.where('completedAt').above(cutoff.toISOString()).toArray();
}

export async function saveSessionResult(
  lessonId: string,
  track: string,
  module: string,
  result: EngineResult,
): Promise<void> {
  const sessionId = crypto.randomUUID();
  const completedAt = new Date().toISOString();

  const session: SessionRecord = {
    id: sessionId,
    lessonId,
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    accuracy: result.accuracy,
    awpm: result.awpm,
    durationMs: result.durationMs,
    errorPositions: result.errorPositions,
    errorChars: result.errorChars,
    completedAt,
  };

  const existing = await db.lessonProgress.get(lessonId);

  const progress: LessonProgress = {
    lessonId,
    track,
    module,
    bestWpm: Math.max(existing?.bestWpm ?? 0, result.wpm),
    bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, result.accuracy),
    bestAwpm: Math.max(existing?.bestAwpm ?? 0, result.awpm),
    attempts: (existing?.attempts ?? 0) + 1,
    completed: result.completed || (existing?.completed ?? false),
    lastPlayedAt: completedAt,
  };

  await db.transaction('rw', db.sessions, db.lessonProgress, async () => {
    await db.sessions.put(session);
    await db.lessonProgress.put(progress);
  });
}

export async function exportProgress(): Promise<ProgressExport> {
  const [settings, lessonProgress, sessions] = await Promise.all([
    db.settings.get('default'),
    db.lessonProgress.toArray(),
    db.sessions.toArray(),
  ]);

  if (!settings) {
    throw new Error('Settings not found');
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    lessonProgress,
    sessions,
  };
}

export async function importProgress(data: ProgressExport): Promise<void> {
  if (data.version !== 1) {
    throw new Error('Unsupported export version');
  }

  await db.transaction('rw', db.settings, db.lessonProgress, db.sessions, async () => {
    await db.settings.put(data.settings);
    await db.lessonProgress.clear();
    await db.sessions.clear();
    await db.lessonProgress.bulkPut(data.lessonProgress);
    await db.sessions.bulkPut(data.sessions);
  });
}

export async function resetProgress(trackId?: string): Promise<void> {
  if (!trackId) {
    await db.transaction('rw', db.lessonProgress, db.sessions, async () => {
      await db.lessonProgress.clear();
      await db.sessions.clear();
    });
    return;
  }

  const progress = await db.lessonProgress.where('track').equals(trackId).toArray();
  const lessonIds = new Set(progress.map((p) => p.lessonId));

  await db.transaction('rw', db.lessonProgress, db.sessions, async () => {
    await db.lessonProgress.where('track').equals(trackId).delete();
    const sessions = await db.sessions.toArray();
    const toDelete = sessions.filter((s) => lessonIds.has(s.lessonId)).map((s) => s.id);
    await db.sessions.bulkDelete(toDelete);
  });
}
