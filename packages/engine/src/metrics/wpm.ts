import type { KeystrokeEvent } from '../types';

const CHARS_PER_WORD = 5;
const LIVE_WINDOW_MS = 5000;
const MIN_ELAPSED_MS = 2000;
const MIN_SPAN_MS = 200;

export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return Math.round(correctChars / CHARS_PER_WORD / minutes);
}

export function calculateRawWpm(totalChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return Math.round(totalChars / CHARS_PER_WORD / minutes);
}

export function calculateAccuracy(events: KeystrokeEvent[]): number {
  if (events.length === 0) return 100;
  const correct = events.filter((e) => e.correct).length;
  return Math.round((correct / events.length) * 100);
}

export function calculateAwpm(wpm: number, accuracy: number): number {
  return Math.round(wpm * (accuracy / 100));
}

export function getRollingWpm(events: KeystrokeEvent[], nowMs: number): number {
  if (nowMs < MIN_ELAPSED_MS) return 0;

  const windowStart = nowMs - LIVE_WINDOW_MS;
  const recentCorrect = events.filter((e) => e.correct && !e.isBackspace && e.timestamp >= windowStart);

  if (recentCorrect.length < 2) return 0;

  const spanMs =
    recentCorrect[recentCorrect.length - 1]!.timestamp - recentCorrect[0]!.timestamp;

  if (spanMs < MIN_SPAN_MS) return 0;

  return Math.round(recentCorrect.length / CHARS_PER_WORD / (spanMs / 60_000));
}

export function getLiveMetrics(
  events: KeystrokeEvent[],
  passage: string,
  input: string,
  elapsedMs: number,
  nowMs: number,
): {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  awpm: number;
  correctChars: number;
} {
  const correctChars = [...input].filter((c, i) => c === passage[i]).length;
  const wpm = getRollingWpm(events, nowMs) || calculateWpm(correctChars, elapsedMs);
  const rawWpm = calculateRawWpm(input.length, elapsedMs);
  const accuracy = calculateAccuracy(events);
  const awpm = calculateAwpm(wpm, accuracy);

  return { wpm, rawWpm, accuracy, awpm, correctChars };
}
