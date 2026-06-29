import { describe, expect, it } from 'vitest';
import {
  aggregateErrorHotspots,
  calculateDayStreak,
  calculateWordAccuracy,
  groupSessionsByDay,
  suggestLessons,
} from '../src/metrics/error-analysis';

describe('error-analysis', () => {
  it('aggregates error hotspots by frequency', () => {
    const hotspots = aggregateErrorHotspots([
      { errorChars: ['{', '}'] },
      { errorChars: ['{', ';'] },
    ]);

    expect(hotspots[0]?.char).toBe('{');
    expect(hotspots[0]?.count).toBe(2);
  });

  it('calculates word accuracy for translation mode', () => {
    const passage = 'hello world test';
    expect(calculateWordAccuracy(passage, 'hello world test')).toBe(100);
    expect(calculateWordAccuracy(passage, 'hello word test')).toBe(67);
  });

  it('suggests lessons matching weak keys', () => {
    const suggestions = suggestLessons(
      [{ char: '{', label: '{', count: 3 }],
      [
        {
          lessonId: 'a',
          title: 'Braces',
          skills: ['curly-braces'],
          difficulty: 1,
          keyboardHints: ['{', '}'],
        },
        {
          lessonId: 'b',
          title: 'Other',
          skills: ['prose'],
          difficulty: 1,
        },
      ],
      new Set(),
    );

    expect(suggestions[0]?.lessonId).toBe('a');
  });

  it('calculates day streak from session dates', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    expect(calculateDayStreak([today, yesterday])).toBeGreaterThanOrEqual(2);
  });

  it('groups sessions by day for charts', () => {
    const today = new Date().toISOString();
    const points = groupSessionsByDay([{ completedAt: today, wpm: 60 }], 7);
    expect(points).toHaveLength(7);
    expect(points.some((p) => p.avgWpm === 60)).toBe(true);
  });
});
