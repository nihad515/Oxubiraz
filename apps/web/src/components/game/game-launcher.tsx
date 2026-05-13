'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameConfig } from './game-config';
import { GameCountdown } from './game-countdown';
import { GameBoard } from './game-board';
import { GameResult } from './game-result';
import { useGame } from '@/hooks/use-game';
import { usePermission } from '@/hooks/use-permission';
import { useString } from '@/hooks/use-string';
import { PERMISSIONS } from '@/types/permissions';

export function GameLauncher() {
  const { t } = useString();
  const { can } = usePermission();
  const { status, resetGame } = useGame();

  if (!can(PERMISSIONS.PLAY_GAME)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="mt-4 text-xl font-bold">{t('errors.forbidden')}</h2>
        <p className="mt-2 text-muted-foreground">{t('game.no_permission', {}, 'You do not have permission to play')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GameConfig />
          </motion.div>
        )}

        {status === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <GameCountdown />
          </motion.div>
        )}

        {status === 'playing' && (
          <motion.div
            key="board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameBoard />
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameResult onPlayAgain={resetGame} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
