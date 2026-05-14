import { create } from 'zustand';

import type { GameSession, GameConfig, GameStatus, GameWord } from '@/types/game';

interface GameState {
  session: GameSession | null;
  status: GameStatus;
  elapsedMs: number;
  clickedCount: number;
  lastClickedIndex: number;
}

interface GameActions {
  initSession: (config: GameConfig, words: string[], targetedWords?: Set<string>) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  clickWord: (wordIndex: number) => void;
  finishGame: () => void;
  resetGame: () => void;
  tick: (ms: number) => void;
}

type GameStore = GameState & GameActions;

const buildWords = (words: string[], targetedWords: Set<string> = new Set()): GameWord[] =>
  words.map((text, index) => ({
    id: `word-${index}`,
    text,
    index,
    clicked: false,
    is_targeted: targetedWords.has(text),
  }));

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  status: 'idle',
  elapsedMs: 0,
  clickedCount: 0,
  lastClickedIndex: -1,

  initSession: (config, words, targetedWords) => {
    const gameWords = buildWords(words, targetedWords);
    set({
      session: {
        id: crypto.randomUUID(),
        config,
        status: 'idle',
        words: gameWords,
        elapsed_ms: 0,
        clicked_count: 0,
        last_clicked_index: -1,
      },
      status: 'countdown',
      elapsedMs: 0,
      clickedCount: 0,
      lastClickedIndex: -1,
    });
  },

  startGame: () => {
    const { session } = get();
    if (!session) return;
    const now = Date.now();
    set({
      status: 'playing',
      session: { ...session, status: 'playing', started_at: now },
    });
  },

  pauseGame: () => set({ status: 'paused' }),

  resumeGame: () => set({ status: 'playing' }),

  clickWord: (wordIndex) => {
    const { session, clickedCount, lastClickedIndex } = get();
    if (!session || get().status !== 'playing') return;
    if (wordIndex !== lastClickedIndex + 1) return; // Must click in order

    const updatedWords = session.words.map((w) =>
      w.index === wordIndex ? { ...w, clicked: true, click_time: Date.now() } : w,
    );
    const newCount = clickedCount + 1;
    const allClicked = newCount === session.words.length;

    set({
      clickedCount: newCount,
      lastClickedIndex: wordIndex,
      session: {
        ...session,
        words: updatedWords,
        clicked_count: newCount,
        last_clicked_index: wordIndex,
      },
    });

    if (allClicked) {
      get().finishGame();
    }
  },

  finishGame: () => {
    const { session, elapsedMs } = get();
    if (!session) return;
    set({
      status: 'finished',
      session: {
        ...session,
        status: 'finished',
        finished_at: Date.now(),
        elapsed_ms: elapsedMs,
      },
    });
  },

  tick: (ms) => {
    const { session, status } = get();
    if (!session || status !== 'playing') return;
    const newElapsed = get().elapsedMs + ms;
    const durationMs = session.config.duration * 1000;

    if (newElapsed >= durationMs) {
      set({ elapsedMs: durationMs });
      get().finishGame();
    } else {
      set({ elapsedMs: newElapsed });
    }
  },

  resetGame: () =>
    set({
      session: null,
      status: 'idle',
      elapsedMs: 0,
      clickedCount: 0,
      lastClickedIndex: -1,
    }),
}));
