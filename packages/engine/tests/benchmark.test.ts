import { describe, expect, it } from 'vitest';
import { TypingSession } from '../src/session';

describe('TypingSession benchmark', () => {
  it('processes keystrokes under 1ms average', () => {
    const passage = 'the quick brown fox jumps over the lazy dog '.repeat(200);
    const session = new TypingSession({
      passage,
      now: () => 0,
    });

    session.prepare();
    session.start();

    const iterations = passage.length;
    const start = performance.now();

    for (const char of passage) {
      session.handleKey(char);
    }

    const elapsedMs = performance.now() - start;
    const avgMsPerKeystroke = elapsedMs / iterations;

    expect(session.getState().status).toBe('complete');
    expect(avgMsPerKeystroke).toBeLessThan(1);
  });
});
