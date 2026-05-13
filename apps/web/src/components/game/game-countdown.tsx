'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGame } from '@/hooks/use-game';
import { useString } from '@/hooks/use-string';

export function GameCountdown() {
  const { t } = useString();
  const { beginGame } = useGame();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      beginGame();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, beginGame]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="mb-8 text-xl font-medium text-muted-foreground">{t('game.countdown')}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-primary"
        >
          {count === 0 ? (
            <span className="text-5xl font-black text-primary">GO!</span>
          ) : (
            <span className="text-7xl font-black text-primary">{count}</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
