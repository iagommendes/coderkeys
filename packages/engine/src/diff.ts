import type { CharState } from './types';

export function buildCharStates(passage: string, input: string): CharState[] {
  const states: CharState[] = [];

  for (let i = 0; i < passage.length; i++) {
    const char = passage[i]!;
    if (i < input.length) {
      states.push({
        char,
        status: input[i] === char ? 'correct' : 'incorrect',
      });
    } else if (i === input.length) {
      states.push({ char, status: 'current' });
    } else {
      states.push({ char, status: 'pending' });
    }
  }

  return states;
}

export function countCorrectChars(passage: string, input: string): number {
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === passage[i]) {
      correct++;
    }
  }
  return correct;
}

export function getErrorPositions(passage: string, input: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== passage[i]) {
      positions.push(i);
    }
  }
  return positions;
}

export function getErrorChars(passage: string, input: string): string[] {
  const chars = new Set<string>();
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== passage[i]) {
      chars.add(passage[i] ?? input[i] ?? '');
    }
  }
  return [...chars].filter(Boolean);
}
