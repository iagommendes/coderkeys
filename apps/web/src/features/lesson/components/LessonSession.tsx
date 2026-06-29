import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TypingSession } from '@coderkeys/engine';
import type { Lesson } from '@coderkeys/schemas';
import { saveSessionResult } from '@/db/repositories/progress.repo';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { CharDisplay } from './CharDisplay';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<TypingSession | null>(null);
  const savedRef = useRef(false);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    sessionRef.current = new TypingSession({
      passage: lesson.content.text,
      strictMode,
    });
    sessionRef.current.prepare();
    inputRef.current?.focus();
    savedRef.current = false;
  }, [lesson, strictMode]);

  const session = sessionRef.current;
  const state = session?.getState();
  const metrics = session?.getLiveMetrics();
  const isComplete = state?.status === 'complete';

  useEffect(() => {
    if (!isComplete || !session || savedRef.current) return;

    savedRef.current = true;
    const result = session.getResult();
    const lessonId = buildLessonId(lesson.track, lesson.module, lesson.locale, lesson.id);

    void saveSessionResult(lessonId, lesson.track, lesson.module, result);
  }, [isComplete, lesson, session]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!session) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab') return;

    event.preventDefault();

    if (state?.status === 'ready') {
      session.start();
    }

    const handled = session.handleKey(event.key);
    if (handled) {
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

        <p className={goalMet ? 'text-success' : 'text-muted'}>
          {goalMet ? t('goalMet') : t('goalMissed')}
        </p>

        <div className="flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}>{t('actions.retry', { ns: 'common' })}</Button>
          <Button variant="secondary" onClick={onComplete}>
            {t('actions.back', { ns: 'common' })}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat label={t('liveWpm')} value={String(metrics?.wpm ?? 0)} />
        <Stat label={t('liveAccuracy')} value={`${metrics?.accuracy ?? 100}%`} />
        <Stat label={t('elapsed')} value={formatTime(metrics?.elapsedMs ?? 0)} />
      </div>

      {strictMode && <p className="text-sm text-muted">{t('strictModeHint')}</p>}

      <div
        className="cursor-text"
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
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
