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
export {
  aggregateErrorHotspots,
  calculateWordAccuracy,
  suggestLessons,
  calculateDayStreak,
  groupSessionsByDay,
  formatCharLabel,
} from './metrics/error-analysis';
export type {
  ErrorHotspot,
  SessionErrorInput,
  LessonCandidate,
  LessonSuggestion,
  DailyWpmPoint,
} from './metrics/error-analysis';
export type {
  SessionStatus,
  KeystrokeEvent,
  CharState,
  LiveMetrics,
  SessionResult,
  TypingSessionOptions,
  TypingSessionState,
} from './types';
