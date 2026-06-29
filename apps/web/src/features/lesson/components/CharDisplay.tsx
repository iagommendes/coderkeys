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
      className={cn(
        'rounded-xl border border-border bg-surface p-6 leading-relaxed',
        display === 'code' ? 'font-mono text-sm whitespace-pre-wrap' : 'text-base',
      )}
      aria-label="Lesson text"
    >
      {states.map((state, index) => (
        <span
          key={`${index}-${state.char}`}
          className={cn(
            'rounded-sm',
            state.status === 'correct' && 'text-success',
            state.status === 'incorrect' && 'bg-error/20 text-error underline decoration-error',
            state.status === 'current' && 'bg-accent/30 text-foreground',
            state.status === 'pending' && 'text-muted',
          )}
        >
          {state.char === '\n' ? '\n' : state.char}
        </span>
      ))}
    </div>
  );
}
