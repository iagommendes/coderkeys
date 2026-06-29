export type SessionStatus = 'idle' | 'ready' | 'active' | 'paused' | 'complete';

export interface KeystrokeEvent {
  char: string;
  correct: boolean;
  position: number;
  timestamp: number;
  isBackspace: boolean;
}

export interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
}

export interface LiveMetrics {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  awpm: number;
  correctChars: number;
  totalKeystrokes: number;
  elapsedMs: number;
}

export interface SessionResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  awpm: number;
  correctChars: number;
  totalKeystrokes: number;
  durationMs: number;
  errorPositions: number[];
  errorChars: string[];
  completed: boolean;
}

export interface TypingSessionOptions {
  passage: string;
  strictMode?: boolean;
  now?: () => number;
}

export interface TypingSessionState {
  status: SessionStatus;
  passage: string;
  input: string;
  cursor: number;
  events: KeystrokeEvent[];
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  strictMode: boolean;
}
