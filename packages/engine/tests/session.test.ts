import { describe, expect, it } from 'vitest';
import { TypingSession } from '../src/session';

describe('TypingSession', () => {
  it('completes a passage when all characters are typed', () => {
    let time = 0;
    const session = new TypingSession({
      passage: 'abcdefghij',
      now: () => time,
    });

    session.prepare();
    session.start();
    time = 12_000;
    for (const char of 'abcdefghij') {
      session.handleKey(char);
    }

    expect(session.getState().status).toBe('complete');
    expect(session.getResult().completed).toBe(true);
    expect(session.getResult().wpm).toBe(10);
    expect(session.getResult().accuracy).toBe(100);
  });

  it('handles backspace', () => {
    const session = new TypingSession({ passage: 'abc' });
    session.prepare();
    session.start();
    session.handleKey('a');
    session.handleKey('x');
    session.handleKey('Backspace');
    session.handleKey('b');
    session.handleKey('c');

    expect(session.getState().input).toBe('abc');
    expect(session.getState().status).toBe('complete');
  });

  it('blocks progress in strict mode on incorrect key', () => {
    const session = new TypingSession({ passage: 'ab', strictMode: true });
    session.prepare();
    session.start();
    session.handleKey('x');

    expect(session.getState().input).toBe('');
    expect(session.getState().status).toBe('active');
  });

  it('pauses and resumes timing', () => {
    let time = 0;
    const session = new TypingSession({
      passage: 'ab',
      now: () => time,
    });

    session.prepare();
    session.start();
    time = 10_000;
    session.pause();
    time = 30_000;
    session.resume();
    time = 40_000;

    expect(session.getElapsedMs()).toBe(20_000);
  });
});
