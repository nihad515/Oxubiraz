'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGameStore } from '@/store/game-store';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { useString } from './use-string';
import type { GameConfig, GameResult } from '@/types/game';
import type { ApiResponse } from '@/types/api';

export function useGame() {
  const {
    session,
    status,
    elapsedMs,
    clickedCount,
    lastClickedIndex,
    initSession,
    startGame,
    pauseGame,
    resumeGame,
    clickWord,
    finishGame,
    resetGame,
    tick,
  } = useGameStore();

  const { t } = useString();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  const startMutation = useMutation({
    mutationFn: (config: GameConfig) =>
      apiClient.post<ApiResponse<{ words: string[]; session_id: string }>>(
        API.game.start,
        config,
      ),
    onSuccess: (data, config) => {
      initSession(config, data.data.words);
    },
    onError: () => {
      toast.error(t('game.start_failed'));
    },
  });

  const finishMutation = useMutation({
    mutationFn: (result: Partial<GameResult>) =>
      apiClient.post<ApiResponse<GameResult>>(API.game.finish, result),
    onSuccess: (data) => {
      toast.success(t('game.finished', { wpm: data.data.wpm }));
    },
  });

  // Timer tick
  useEffect(() => {
    if (status === 'playing') {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        tick(delta);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, tick]);

  // Auto-submit result when game finishes
  useEffect(() => {
    if (status === 'finished' && session) {
      const durationSeconds = session.config.duration;
      const actualSeconds = Math.min(elapsedMs / 1000, durationSeconds);
      const wordsRead = lastClickedIndex + 1;
      const wpm = actualSeconds > 0 ? Math.round((wordsRead / actualSeconds) * 60) : 0;
      const accuracy = session.words.length > 0
        ? Math.round((wordsRead / session.words.length) * 100)
        : 0;

      finishMutation.mutate({
        mode: session.config.mode,
        duration: session.config.duration,
        language: session.config.language,
        total_words: session.words.length,
        clicked_words: wordsRead,
        wpm,
        accuracy,
        completion_percentage: accuracy,
        time_elapsed_ms: elapsedMs,
        is_completed: wordsRead === session.words.length,
        word_list_id: session.config.word_list_id,
        text_id: session.config.text_id,
      });
    }
  }, [status]);

  const progressPercent = session
    ? Math.min((elapsedMs / (session.config.duration * 1000)) * 100, 100)
    : 0;

  const remainingSeconds = session
    ? Math.max(0, session.config.duration - Math.floor(elapsedMs / 1000))
    : 0;

  const currentWpm = useCallback(() => {
    if (!session || elapsedMs === 0) return 0;
    const seconds = elapsedMs / 1000;
    const words = lastClickedIndex + 1;
    return Math.round((words / seconds) * 60);
  }, [session, elapsedMs, lastClickedIndex]);

  return {
    session,
    status,
    elapsedMs,
    clickedCount,
    lastClickedIndex,
    progressPercent,
    remainingSeconds,
    currentWpm: currentWpm(),
    startGame: (config: GameConfig) => startMutation.mutate(config),
    isStarting: startMutation.isPending,
    beginGame: startGame,
    pauseGame,
    resumeGame,
    clickWord,
    finishGame,
    resetGame,
    isSubmitting: finishMutation.isPending,
    finalResult: finishMutation.data?.data,
  };
}
