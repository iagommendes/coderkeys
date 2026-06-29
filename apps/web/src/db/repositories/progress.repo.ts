import type { SessionResult as EngineResult } from '@coderkeys/engine';
import { db, type LessonProgress, type SessionRecord } from '../database';

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  return db.lessonProgress.get(lessonId);
}

export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  return db.lessonProgress.toArray();
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
