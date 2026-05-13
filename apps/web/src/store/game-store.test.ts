import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './game-store';

const CONFIG = {
  mode: 'random_words' as const,
  duration: 60,
  language: 'az' as const,
  word_count: 5,
};

const WORDS = ['alma', 'arpa', 'bağ', 'çay', 'daş'];

function resetStore() {
  useGameStore.getState().resetGame();
}

describe('game store – initial state', () => {
  beforeEach(resetStore);

  it('starts idle with no session', () => {
    const state = useGameStore.getState();
    expect(state.status).toBe('idle');
    expect(state.session).toBeNull();
    expect(state.elapsedMs).toBe(0);
    expect(state.clickedCount).toBe(0);
  });
});

describe('game store – session init', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().initSession(CONFIG, WORDS);
  });

  it('moves to countdown after initSession', () => {
    expect(useGameStore.getState().status).toBe('countdown');
  });

  it('builds word list correctly', () => {
    const { session } = useGameStore.getState();
    expect(session?.words).toHaveLength(5);
    expect(session?.words[0].text).toBe('alma');
    expect(session?.words[0].clicked).toBe(false);
    expect(session?.words[0].index).toBe(0);
  });

  it('resets counters', () => {
    expect(useGameStore.getState().clickedCount).toBe(0);
    expect(useGameStore.getState().lastClickedIndex).toBe(-1);
  });
});

describe('game store – playing flow', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().initSession(CONFIG, WORDS);
    useGameStore.getState().startGame();
  });

  it('status becomes playing after startGame', () => {
    expect(useGameStore.getState().status).toBe('playing');
  });

  it('can click the first word', () => {
    useGameStore.getState().clickWord(0);
    const state = useGameStore.getState();
    expect(state.clickedCount).toBe(1);
    expect(state.lastClickedIndex).toBe(0);
    expect(state.session?.words[0].clicked).toBe(true);
  });

  it('cannot skip words — must click in order', () => {
    useGameStore.getState().clickWord(2); // skip 0 and 1
    expect(useGameStore.getState().clickedCount).toBe(0); // no change
  });

  it('clicking all words in order finishes the game', () => {
    WORDS.forEach((_, i) => useGameStore.getState().clickWord(i));
    expect(useGameStore.getState().status).toBe('finished');
  });

  it('tick advances elapsedMs', () => {
    useGameStore.getState().tick(1000);
    expect(useGameStore.getState().elapsedMs).toBe(1000);
  });

  it('tick does not advance when paused', () => {
    useGameStore.getState().pauseGame();
    useGameStore.getState().tick(1000);
    expect(useGameStore.getState().elapsedMs).toBe(0);
  });

  it('tick finishes game when duration is reached', () => {
    useGameStore.getState().tick(60_000); // exact duration
    expect(useGameStore.getState().status).toBe('finished');
  });

  it('tick caps elapsed at duration, not beyond', () => {
    useGameStore.getState().tick(999_999);
    expect(useGameStore.getState().elapsedMs).toBe(60_000);
  });
});

describe('game store – pause and resume', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().initSession(CONFIG, WORDS);
    useGameStore.getState().startGame();
  });

  it('can pause a running game', () => {
    useGameStore.getState().pauseGame();
    expect(useGameStore.getState().status).toBe('paused');
  });

  it('can resume a paused game', () => {
    useGameStore.getState().pauseGame();
    useGameStore.getState().resumeGame();
    expect(useGameStore.getState().status).toBe('playing');
  });

  it('cannot click words while paused', () => {
    useGameStore.getState().pauseGame();
    useGameStore.getState().clickWord(0);
    expect(useGameStore.getState().clickedCount).toBe(0);
  });
});

describe('game store – finish and reset', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().initSession(CONFIG, WORDS);
    useGameStore.getState().startGame();
  });

  it('finishGame sets status to finished', () => {
    useGameStore.getState().finishGame();
    expect(useGameStore.getState().status).toBe('finished');
  });

  it('reset clears everything', () => {
    useGameStore.getState().finishGame();
    useGameStore.getState().resetGame();
    const state = useGameStore.getState();
    expect(state.status).toBe('idle');
    expect(state.session).toBeNull();
    expect(state.elapsedMs).toBe(0);
    expect(state.clickedCount).toBe(0);
  });
});
