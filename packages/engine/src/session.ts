import { getErrorChars, getErrorPositions } from './diff';
import {
  calculateAccuracy,
  calculateAwpm,
  calculateRawWpm,
  calculateWpm,
  getLiveMetrics,
} from './metrics/wpm';
import type {
  LiveMetrics,
  SessionResult,
  TypingSessionOptions,
  TypingSessionState,
} from './types';

function createInitialState(passage: string, strictMode: boolean): TypingSessionState {
  return {
    status: 'idle',
    passage,
    input: '',
    cursor: 0,
    events: [],
    startedAt: null,
    pausedAt: null,
    totalPausedMs: 0,
    strictMode,
  };
}

export class TypingSession {
  private state: TypingSessionState;
  private readonly now: () => number;

  constructor(options: TypingSessionOptions) {
    this.now = options.now ?? (() => performance.now());
    this.state = createInitialState(options.passage, options.strictMode ?? false);
  }

  getState(): Readonly<TypingSessionState> {
    return this.state;
  }

  prepare(): void {
    if (this.state.status !== 'idle') return;
    this.state = { ...this.state, status: 'ready' };
  }

  start(): void {
    if (this.state.status !== 'ready' && this.state.status !== 'idle') return;
    this.state = {
      ...this.state,
      status: 'active',
      startedAt: this.now(),
    };
  }

  pause(): void {
    if (this.state.status !== 'active') return;
    this.state = {
      ...this.state,
      status: 'paused',
      pausedAt: this.now(),
    };
  }

  resume(): void {
    if (this.state.status !== 'paused' || this.state.pausedAt === null) return;
    const pausedDuration = this.now() - this.state.pausedAt;
    this.state = {
      ...this.state,
      status: 'active',
      pausedAt: null,
      totalPausedMs: this.state.totalPausedMs + pausedDuration,
    };
  }

  reset(): void {
    this.state = createInitialState(this.state.passage, this.state.strictMode);
  }

  handleKey(key: string): boolean {
    if (this.state.status === 'idle') {
      this.prepare();
      this.start();
    } else if (this.state.status === 'ready') {
      this.start();
    }

    if (this.state.status !== 'active') return false;

    const timestamp = this.now();

    if (key === 'Backspace') {
      if (this.state.input.length === 0) return false;
      const newInput = this.state.input.slice(0, -1);
      this.state = {
        ...this.state,
        input: newInput,
        cursor: newInput.length,
        events: [
          ...this.state.events,
          {
            char: 'Backspace',
            correct: false,
            position: newInput.length,
            timestamp,
            isBackspace: true,
          },
        ],
      };
      return true;
    }

    if (key.length !== 1) return false;

    const position = this.state.input.length;
    if (position >= this.state.passage.length) return false;

    const expected = this.state.passage[position]!;
    const correct = key === expected;

    if (this.state.strictMode && !correct) {
      this.state = {
        ...this.state,
        events: [
          ...this.state.events,
          {
            char: key,
            correct: false,
            position,
            timestamp,
            isBackspace: false,
          },
        ],
      };
      return true;
    }

    const newInput = this.state.input + key;
    const isComplete = newInput.length === this.state.passage.length;

    this.state = {
      ...this.state,
      input: newInput,
      cursor: newInput.length,
      status: isComplete ? 'complete' : 'active',
      events: [
        ...this.state.events,
        {
          char: key,
          correct,
          position,
          timestamp,
          isBackspace: false,
        },
      ],
    };

    return true;
  }

  getElapsedMs(): number {
    if (this.state.startedAt === null) return 0;
    const end = this.state.status === 'paused' && this.state.pausedAt
      ? this.state.pausedAt
      : this.now();
    return Math.max(0, end - this.state.startedAt - this.state.totalPausedMs);
  }

  getLiveMetrics(): LiveMetrics {
    const elapsedMs = this.getElapsedMs();
    const metrics = getLiveMetrics(
      this.state.events,
      this.state.passage,
      this.state.input,
      elapsedMs,
      elapsedMs,
    );

    return {
      ...metrics,
      totalKeystrokes: this.state.events.length,
      elapsedMs,
    };
  }

  getResult(): SessionResult {
    const elapsedMs = this.getElapsedMs();
    const correctChars = [...this.state.input].filter(
      (c, i) => c === this.state.passage[i],
    ).length;
    const wpm = calculateWpm(correctChars, elapsedMs);
    const rawWpm = calculateRawWpm(this.state.input.length, elapsedMs);
    const accuracy = calculateAccuracy(this.state.events);
    const awpm = calculateAwpm(wpm, accuracy);

    return {
      wpm,
      rawWpm,
      accuracy,
      awpm,
      correctChars,
      totalKeystrokes: this.state.events.length,
      durationMs: elapsedMs,
      errorPositions: getErrorPositions(this.state.passage, this.state.input),
      errorChars: getErrorChars(this.state.passage, this.state.input),
      completed: this.state.status === 'complete',
    };
  }
}
