export { TypingSession } from './session';
export { buildCharStates, countCorrectChars, getErrorPositions, getErrorChars } from './diff';
export {
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateAwpm,
  getRollingWpm,
  getLiveMetrics,
} from './metrics/wpm';
export type {
  SessionStatus,
  KeystrokeEvent,
  CharState,
  LiveMetrics,
  SessionResult,
  TypingSessionOptions,
  TypingSessionState,
} from './types';
