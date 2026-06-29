import { describe, expect, it } from 'vitest';
import { buildCharStates, countCorrectChars, getErrorPositions } from '../src/diff';

describe('diff utilities', () => {
  const passage = 'hello';

  it('builds char states for partial input', () => {
    const states = buildCharStates(passage, 'hel');
    expect(states.map((s) => s.status)).toEqual([
      'correct',
      'correct',
      'correct',
      'current',
      'pending',
    ]);
  });

  it('marks incorrect characters', () => {
    const states = buildCharStates(passage, 'hxl');
    expect(states[1]?.status).toBe('incorrect');
  });

  it('counts correct characters', () => {
    expect(countCorrectChars(passage, 'hxllo')).toBe(4);
  });

  it('finds error positions', () => {
    expect(getErrorPositions(passage, 'hxllo')).toEqual([1]);
  });
});
