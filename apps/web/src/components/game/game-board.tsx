'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, Clock, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/use-game';
import { useString } from '@/hooks/use-string';
import { cn } from '@/lib/utils/cn';
import { formatMs } from '@/lib/utils/format';

export function GameBoard() {
  const { t } = useString();
  const {
    session,
    status,
    progressPercent,
    remainingSeconds,
    currentWpm,
    clickedCount,
    lastClickedIndex,
    clickWord,
    pauseGame,
    resumeGame,
    finishGame,
  } = useGame();

  const containerRef = useRef<HTMLDivElement>(null);

  const handleWordClick = useCallback(
    (index: number) => {
      clickWord(index);

      // Auto-scroll to keep next word in view
      const container = containerRef.current;
      if (container && index % 5 === 0) {
        const wordEl = container.querySelector(`[data-word-index="${index + 1}"]`);
        wordEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [clickWord],
  );

  if (!session) return null;

  const isPaused = status === 'paused';
  const isAiMode = session.config.mode === 'ai';
  const targetedCount = isAiMode ? session.words.filter(w => w.is_targeted).length : 0;

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="sticky top-0 z-10 rounded-xl border bg-card/95 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 min-w-[80px]">
            <Clock size={18} className="text-muted-foreground" />
            <span
              className={cn(
                'text-2xl font-black tabular-nums',
                remainingSeconds <= 10 && 'text-destructive animate-pulse',
                remainingSeconds > 10 && 'text-foreground',
              )}
            >
              {remainingSeconds}s
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <Progress
              value={progressPercent}
              className="h-3"
              indicatorClassName={cn(
                'transition-none',
                remainingSeconds <= 10 ? 'bg-destructive' : 'bg-primary',
              )}
            />
          </div>

          {/* WPM */}
          <div className="text-right min-w-[80px]">
            <div className="text-xs text-muted-foreground">{t('game.wpm')}</div>
            <div className="text-2xl font-black text-primary tabular-nums">{currentWpm}</div>
          </div>

          {/* Pause/Resume */}
          <Button
            variant="outline"
            size="icon"
            onClick={isPaused ? resumeGame : pauseGame}
            aria-label={isPaused ? 'Resume' : 'Pause'}
            className="flex-shrink-0"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </Button>
        </div>

        {/* Word progress */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{clickedCount} / {session.words.length} {t('game.words', {}, 'words')}</span>
          <div className="flex items-center gap-2">
            {isAiMode && (
              <span className="flex items-center gap-1 text-purple-500">
                <Sparkles size={11} />
                {targetedCount} {t('game.ai_targeted', {}, 'targeted')}
              </span>
            )}
            <span>{Math.round((clickedCount / session.words.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-xl bg-background/90 backdrop-blur-sm"
        >
          <div className="text-4xl">⏸️</div>
          <h2 className="text-2xl font-bold">{t('game.paused', {}, 'Paused')}</h2>
          <Button onClick={resumeGame} size="lg" variant="game">
            <Play size={20} />
            {t('game.resume', {}, 'Resume')}
          </Button>
        </motion.div>
      )}

      {/* Word grid */}
      <div
        ref={containerRef}
        className={cn(
          'relative min-h-[400px] rounded-xl border bg-card p-6',
          isPaused && 'blur-sm pointer-events-none select-none',
        )}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-4 text-xl leading-relaxed sm:text-2xl">
          {session.words.map((word, idx) => {
            const isClicked = word.clicked;
            const isNext = idx === lastClickedIndex + 1;
            const isFuture = idx > lastClickedIndex + 1;

            return (
              <motion.button
                key={word.id}
                data-word-index={idx}
                type="button"
                onClick={() => handleWordClick(idx)}
                whileTap={{ scale: 0.95 }}
                disabled={isClicked || (idx !== lastClickedIndex + 1)}
                aria-label={`Word: ${word.text}`}
                className={cn(
                  'relative rounded-md px-1.5 py-0.5 font-medium transition-all duration-150',
                  'touch-manipulation cursor-pointer',
                  // Clicked
                  isClicked && 'text-muted-foreground/40 line-through scale-95',
                  // Next to click (highlighted)
                  isNext && 'word-clickable word-current ring-2 ring-primary ring-offset-1 scale-110',
                  // AI targeted + next: purple ring override
                  isNext && isAiMode && word.is_targeted && 'ring-purple-500',
                  // Future words
                  isFuture && 'word-clickable opacity-70',
                  // Wrong order click disabled
                  !isClicked && !isNext && 'cursor-not-allowed opacity-50',
                )}
              >
                {/* AI targeted indicator dot */}
                {isAiMode && word.is_targeted && !isClicked && (
                  <span
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-purple-500"
                    aria-hidden="true"
                  />
                )}
                {word.text}
              </motion.button>
            );
          })}
        </div>

        {/* Instruction overlay when starting */}
        {clickedCount === 0 && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary/90 px-4 py-2 text-sm text-primary-foreground shadow-lg"
          >
            {t('game.click_words')}
          </motion.div>
        )}
      </div>

      {/* Give up button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={finishGame}
          className="text-muted-foreground"
        >
          {t('game.finish')}
        </Button>
      </div>
    </div>
  );
}
