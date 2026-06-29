import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TypingSession, calculateWordAccuracy } from '@coderkeys/engine';
import type { Lesson } from '@coderkeys/schemas';
import { saveSessionResult } from '@/db/repositories/progress.repo';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { useKeySound } from '@/shared/hooks/useKeySound';
import { useInterval } from '@/shared/hooks/useInterval';
import { CharDisplay } from './CharDisplay';
import { CodePreview } from './CodePreview';
import { TranslationPanel } from './TranslationPanel';
import { Button, Card } from '@/shared/components/ui';
import { buildLessonId } from '@/features/catalog/lesson-loader';

interface LessonSessionProps {
  lesson: Lesson;
  onComplete: () => void;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LessonSession({ lesson, onComplete }: LessonSessionProps) {
  const { t } = useTranslation('lesson');
  const strictMode = useSettingsStore((s) => s.strictMode);
  const playKeySound = useKeySound();
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<TypingSession | null>(null);
  const savedRef = useRef(false);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const resetSession = useCallback(() => {
    sessionRef.current = new TypingSession({
      passage: lesson.content.text,
      strictMode,
    });
    sessionRef.current.prepare();
    savedRef.current = false;
    inputRef.current?.focus();
    forceRender();
  }, [lesson, strictMode]);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const session = sessionRef.current;
  const state = session?.getState();
  const metrics = session?.getLiveMetrics();
  const isComplete = state?.status === 'complete';
  const isPaused = state?.status === 'paused';
  const isActive = state?.status === 'active' || state?.status === 'ready';

  useInterval(
    () => forceRender(),
    isActive && !isPaused ? 200 : null,
  );

  useEffect(() => {
    if (!isComplete || !session || savedRef.current) return;

    savedRef.current = true;
    const result = session.getResult();
    const lessonId = buildLessonId(lesson.track, lesson.module, lesson.locale, lesson.id);

    void saveSessionResult(lessonId, lesson.track, lesson.module, result);
  }, [isComplete, lesson, session]);

  const wordAccuracy =
    lesson.mode === 'translation' && state
      ? calculateWordAccuracy(lesson.content.text, state.input)
      : null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!session) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      if (state?.status === 'active') {
        session.pause();
      } else if (state?.status === 'paused') {
        session.resume();
        inputRef.current?.focus();
      }
      forceRender();
      return;
    }

    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      resetSession();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab') return;

    event.preventDefault();

    if (state?.status === 'ready') {
      session.start();
    }

    if (state?.status === 'paused') return;

    let key = event.key;
    if (key === 'Enter') key = '\n';

    const handled = session.handleKey(key);
    if (handled) {
      playKeySound();
      forceRender();
    }
  };

  const goalMet =
    lesson.goals &&
    metrics &&
    (!lesson.goals.minWpm || metrics.wpm >= lesson.goals.minWpm) &&
    (!lesson.goals.minAccuracy || metrics.accuracy >= lesson.goals.minAccuracy);

  if (isComplete && session) {
    const result = session.getResult();
    const finalWordAccuracy = calculateWordAccuracy(lesson.content.text, state?.input ?? '');

    return (
      <Card className="space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-bold">{t('completeTitle')}</h2>
          <p className="mt-2 text-muted">{t('completeSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label={t('liveWpm')} value={String(result.wpm)} />
          <Stat label={t('liveAccuracy')} value={`${result.accuracy}%`} />
          <Stat label={t('liveAwpm')} value={String(result.awpm)} />
          <Stat label={t('elapsed')} value={formatTime(result.durationMs)} />
        </div>

        {lesson.mode === 'translation' && (
          <p className="text-sm text-muted">
            {t('wordAccuracy')}: {finalWordAccuracy}%
          </p>
        )}

        <p className={goalMet ? 'text-success' : 'text-muted'}>
          {goalMet ? t('goalMet') : t('goalMissed')}
        </p>

        <div className="flex justify-center gap-3">
          <Button onClick={resetSession}>{t('actions.retry', { ns: 'common' })}</Button>
          <Button variant="secondary" onClick={onComplete}>
            {t('actions.back', { ns: 'common' })}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t('liveWpm')} value={String(metrics?.wpm ?? 0)} />
        <Stat label={t('liveAccuracy')} value={`${metrics?.accuracy ?? 100}%`} />
        <Stat label={t('elapsed')} value={formatTime(metrics?.elapsedMs ?? 0)} />
        {wordAccuracy !== null && (
          <Stat label={t('wordAccuracy')} value={`${wordAccuracy}%`} />
        )}
      </div>

      {isPaused && (
        <Card className="border-accent/50 bg-accent/10 text-center text-sm">
          {t('paused')} — {t('pressEscToResume')}
        </Card>
      )}

      {strictMode && <p className="text-sm text-muted">{t('strictModeHint')}</p>}
      <p className="text-xs text-muted">{t('shortcuts')}</p>

      {lesson.mode === 'translation' && lesson.content.sourceText && (
        <TranslationPanel sourceText={lesson.content.sourceText} />
      )}

      <div
        className="cursor-text"
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        {lesson.content.display === 'code' && state?.status === 'ready' && (
          <div className="mb-4">
            <CodePreview code={lesson.content.text} language={lesson.content.language} />
          </div>
        )}

        <CharDisplay
          passage={lesson.content.text}
          input={state?.input ?? ''}
          display={lesson.content.display}
        />

        {state?.status === 'ready' && (
          <p className="mt-3 text-center text-sm text-muted">{t('pressToStart')}</p>
        )}
      </div>

      <input
        ref={inputRef}
        className="sr-only"
        autoFocus
        aria-label="Typing input"
        onKeyDown={handleKeyDown}
        value=""
        onChange={() => {}}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}
