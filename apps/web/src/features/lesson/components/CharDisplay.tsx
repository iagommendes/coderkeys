import { buildCharStates } from '@coderkeys/engine';
import { cn } from '@/shared/lib/cn';

interface CharDisplayProps {
  passage: string;
  input: string;
  display: 'code' | 'prose';
}

export function CharDisplay({ passage, input, display }: CharDisplayProps) {
  const states = buildCharStates(passage, input);

  return (
    <div
      data-testid="lesson-passage"
      data-passage={passage}
      className={cn(
        'rounded-xl border border-border bg-surface p-6 leading-relaxed transition-colors',
        display === 'code' ? 'font-mono text-sm whitespace-pre-wrap' : 'text-base',
      )}
      aria-label="Lesson text"
    >
      {states.map((state, index) => (
        <span
          key={`${index}-${state.char}`}
          className={cn(
            'rounded-sm transition-colors duration-75',
            state.status === 'correct' && 'text-success',
            state.status === 'incorrect' && 'bg-error/20 text-error underline decoration-error',
            state.status === 'current' && 'char-current bg-accent/30 text-foreground',
            state.status === 'pending' && 'text-muted',
          )}
        >
          {state.char === '\n' ? '\n' : state.char}
        </span>
      ))}
    </div>
  );
}
