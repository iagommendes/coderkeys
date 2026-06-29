export interface ErrorHotspot {
  char: string;
  label: string;
  count: number;
}

export interface SessionErrorInput {
  errorChars: string[];
}

const CHAR_LABELS: Record<string, string> = {
  ' ': 'space',
  '\n': 'newline',
  '\t': 'tab',
  '{': '{',
  '}': '}',
  '[': '[',
  ']': ']',
  '(': '(',
  ')': ')',
  ';': ';',
  ':': ':',
  ',': ',',
  '.': '.',
  '`': '`',
  '"': '"',
  "'": "'",
  '/': '/',
  '\\': '\\',
  '|': '|',
  '=': '=',
  '>': '>',
  '<': '<',
  '-': '-',
  '+': '+',
  '*': '*',
  '&': '&',
  '$': '$',
};

export function formatCharLabel(char: string): string {
  if (char in CHAR_LABELS) return CHAR_LABELS[char]!;
  if (char === '=>') return '=>';
  return char;
}

export function aggregateErrorHotspots(
  sessions: SessionErrorInput[],
  limit = 12,
): ErrorHotspot[] {
  const counts = new Map<string, number>();

  for (const session of sessions) {
    for (const char of session.errorChars) {
      if (!char) continue;
      counts.set(char, (counts.get(char) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([char, count]) => ({
      char,
      label: formatCharLabel(char),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function calculateWordAccuracy(passage: string, input: string): number {
  const expectedWords = passage.trim().split(/\s+/).filter(Boolean);
  const typedWords = input.trim().split(/\s+/).filter(Boolean);

  if (expectedWords.length === 0) return 100;

  let correct = 0;
  for (let i = 0; i < typedWords.length; i++) {
    if (typedWords[i] === expectedWords[i]) {
      correct++;
    }
  }

  return Math.round((correct / expectedWords.length) * 100);
}

export interface LessonCandidate {
  lessonId: string;
  title: string;
  skills: string[];
  difficulty: number;
  keyboardHints?: string[];
}

export interface LessonSuggestion {
  lessonId: string;
  title: string;
  reason: string;
  score: number;
}

export function suggestLessons(
  hotspots: ErrorHotspot[],
  lessons: LessonCandidate[],
  completedLessonIds: Set<string>,
  limit = 5,
): LessonSuggestion[] {
  if (hotspots.length === 0) {
    return lessons
      .filter((l) => !completedLessonIds.has(l.lessonId))
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, limit)
      .map((l) => ({
        lessonId: l.lessonId,
        title: l.title,
        reason: 'recommended',
        score: 1,
      }));
  }

  const weakChars = new Set(hotspots.map((h) => h.char));

  const scored = lessons
    .filter((l) => !completedLessonIds.has(l.lessonId))
    .map((lesson) => {
      let score = 0;
      const matchedChars: string[] = [];

      for (const hint of lesson.keyboardHints ?? []) {
        if (weakChars.has(hint)) {
          score += 3;
          matchedChars.push(hint);
        }
      }

      for (const hotspot of hotspots.slice(0, 5)) {
        if (lesson.skills.some((s) => s.includes(hotspot.label) || s.includes(hotspot.char))) {
          score += 2;
        }
      }

      score += Math.max(0, 3 - lesson.difficulty);

      return {
        lessonId: lesson.lessonId,
        title: lesson.title,
        reason:
          matchedChars.length > 0
            ? `weakKeys:${matchedChars.join(',')}`
            : score > 0
              ? 'skillMatch'
              : 'practice',
        score,
      };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length > 0) return scored;

  return lessons
    .filter((l) => !completedLessonIds.has(l.lessonId))
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, limit)
    .map((l) => ({
      lessonId: l.lessonId,
      title: l.title,
      reason: 'recommended',
      score: 1,
    }));
}

export function calculateDayStreak(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0;

  const uniqueDays = [...new Set(sessionDates.map((d) => d.slice(0, 10)))].sort().reverse();
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < uniqueDays.length + 1; i++) {
    const dayStr = checkDate.toISOString().slice(0, 10);
    if (uniqueDays.includes(dayStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export interface DailyWpmPoint {
  date: string;
  avgWpm: number;
  sessions: number;
}

export function groupSessionsByDay(
  sessions: { completedAt: string; wpm: number }[],
  days: number,
): DailyWpmPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);

  const buckets = new Map<string, { total: number; count: number }>();

  for (const session of sessions) {
    const date = session.completedAt.slice(0, 10);
    const sessionDate = new Date(session.completedAt);
    if (sessionDate < cutoff) continue;

    const bucket = buckets.get(date) ?? { total: 0, count: 0 };
    bucket.total += session.wpm;
    bucket.count += 1;
    buckets.set(date, bucket);
  }

  const points: DailyWpmPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const bucket = buckets.get(date);
    points.push({
      date,
      avgWpm: bucket ? Math.round(bucket.total / bucket.count) : 0,
      sessions: bucket?.count ?? 0,
    });
  }

  return points;
}
