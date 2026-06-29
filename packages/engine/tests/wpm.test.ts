import { describe, expect, it } from 'vitest';
import { calculateAccuracy, calculateAwpm, calculateRawWpm, calculateWpm, getRollingWpm } from '../src/metrics/wpm';
import type { KeystrokeEvent } from '../src/types';

describe('WPM calculations', () => {
  it('calculates WPM from correct characters', () => {
    // 50 correct chars in 60 seconds = 10 WPM
    expect(calculateWpm(50, 60_000)).toBe(10);
  });

  it('returns 0 for zero elapsed time', () => {
    expect(calculateWpm(50, 0)).toBe(0);
  });

  it('calculates raw WPM from total characters', () => {
    expect(calculateRawWpm(50, 60_000)).toBe(10);
  });

  it('calculates accuracy from keystroke events', () => {
    const events: KeystrokeEvent[] = [
      { char: 'a', correct: true, position: 0, timestamp: 0, isBackspace: false },
      { char: 'b', correct: false, position: 1, timestamp: 100, isBackspace: false },
      { char: 'Backspace', correct: false, position: 0, timestamp: 200, isBackspace: true },
    ];
    expect(calculateAccuracy(events)).toBe(33);
  });

  it('returns 100% accuracy for empty events', () => {
    expect(calculateAccuracy([])).toBe(100);
  });

  it('calculates AWPM', () => {
    expect(calculateAwpm(100, 90)).toBe(90);
  });

  it('calculates rolling WPM using event window', () => {
    const events: KeystrokeEvent[] = [
      { char: 'a', correct: true, position: 0, timestamp: 1000, isBackspace: false },
      { char: 'b', correct: true, position: 1, timestamp: 1500, isBackspace: false },
      { char: 'c', correct: true, position: 2, timestamp: 2000, isBackspace: false },
      { char: 'd', correct: true, position: 3, timestamp: 2500, isBackspace: false },
      { char: 'e', correct: true, position: 4, timestamp: 3000, isBackspace: false },
    ];
    // 5 chars in 2 seconds = 30 WPM
    expect(getRollingWpm(events, 3000)).toBe(30);
  });
});
