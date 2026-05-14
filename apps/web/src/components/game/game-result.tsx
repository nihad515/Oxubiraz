'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { RotateCcw, Trophy, Zap, CheckCircle, Clock, Star, Sparkles, Brain, MessageSquare, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGame } from '@/hooks/use-game';
import { useString } from '@/hooks/use-string';
import { useStringStore } from '@/store/string-store';
import { formatWpm } from '@/lib/utils/format';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

interface GameResultProps {
  onPlayAgain: () => void;
}

export function GameResult({ onPlayAgain }: GameResultProps) {
  const { t } = useString();
  const { locale } = useStringStore();
  const { session, finalResult, elapsedMs, clickedCount, lastClickedIndex } = useGame();
  const windowSize = useRef({ width: window?.innerWidth ?? 0, height: window?.innerHeight ?? 0 });

  const [coachingTip, setCoachingTip] = useState<string | null>(null);
  const [coachingLoading, setCoachingLoading] = useState(false);
  const [coachingFetched, setCoachingFetched] = useState(false);

  if (!session) return null;

  const totalWords = session.words.length;
  const wordsRead = lastClickedIndex + 1;
  const isCompleted = wordsRead === totalWords;
  const duration = session.config.duration;
  const actualSeconds = Math.min(elapsedMs / 1000, duration);
  const wpm = actualSeconds > 0 ? Math.round((wordsRead / actualSeconds) * 60) : 0;
  const accuracy = totalWords > 0 ? Math.round((wordsRead / totalWords) * 100) : 0;
  const xpEarned = finalResult?.xp_earned ?? 0;

  const isAiMode = session.config.mode === 'ai';
  const targetedWords = session.words.filter(w => w.is_targeted);
  const targetedRead = targetedWords.filter(w => w.clicked).length;
  const targetedRate = targetedWords.length > 0
    ? Math.round((targetedRead / targetedWords.length) * 100)
    : null;

  const fetchCoaching = async () => {
    if (coachingFetched) return;
    setCoachingLoading(true);
    setCoachingFetched(true);
    try {
      const res: any = await apiClient.post(API.game.aiCoaching, {
        wpm,
        accuracy,
        mode: session.config.mode,
        duration: session.config.duration,
        language: locale,
        targeted_rate: targetedRate,
        top_weak_words: targetedWords.filter(w => !w.clicked).map(w => w.text).slice(0, 5),
      });
      setCoachingTip(res.data?.tip ?? null);
    } catch {
      setCoachingTip(null);
    } finally {
      setCoachingLoading(false);
    }
  };

  const getPerformanceRating = () => {
    if (wpm >= 200) return { label: 'Excellent!', emoji: '🏆', color: 'text-yellow-500' };
    if (wpm >= 120) return { label: 'Great!', emoji: '⭐', color: 'text-blue-500' };
    if (wpm >= 80) return { label: 'Good!', emoji: '👍', color: 'text-green-500' };
    return { label: 'Keep practicing!', emoji: '💪', color: 'text-muted-foreground' };
  };

  const rating = getPerformanceRating();

  return (
    <div className="space-y-6">
      {isCompleted && wpm >= 100 && (
        <ReactConfetti
          width={windowSize.current.width}
          height={windowSize.current.height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
        />
      )}

      {/* Hero result card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className="overflow-hidden border-2 border-primary/20">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-center text-white">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl mb-2"
            >
              {rating.emoji}
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-7xl font-black mb-2"
            >
              {wpm}
            </motion.div>
            <div className="text-2xl font-semibold opacity-90">{t('game.wpm')}</div>
            <div className="mt-2 text-lg opacity-75">{rating.label}</div>
          </div>

          <CardContent className="p-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  icon: <CheckCircle size={20} className="text-green-500" />,
                  value: `${wordsRead}/${totalWords}`,
                  label: t('game.words_read', {}, 'Words Read'),
                },
                {
                  icon: <Clock size={20} className="text-blue-500" />,
                  value: `${Math.round(actualSeconds)}s`,
                  label: t('game.time', {}, 'Time'),
                },
                {
                  icon: <Trophy size={20} className="text-yellow-500" />,
                  value: `${accuracy}%`,
                  label: t('game.completion', {}, 'Completion'),
                },
                {
                  icon: <Star size={20} className="text-purple-500" />,
                  value: `+${xpEarned}`,
                  label: t('game.xp_earned', {}, 'XP Earned'),
                },
              ].map(({ icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 rounded-xl border p-3 text-center">
                  {icon}
                  <span className="text-xl font-bold">{value}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Completion progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('game.completion', {}, 'Completion')}</span>
                <span className="font-medium">{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* XP celebration */}
      {xpEarned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center dark:border-purple-800 dark:bg-purple-950/30"
        >
          <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
            <Zap size={20} />
            <span className="text-lg font-bold">
              {t('achievement.xp_earned', { xp: xpEarned })}
            </span>
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      {isAiMode && targetedRate !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-purple-300/50 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 p-4 dark:from-purple-950/30 dark:to-indigo-950/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {t('game.ai_insights_title', {}, 'AI Training Insights')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-purple-100/60 dark:bg-purple-900/30 p-3">
              <div className="flex items-center justify-center gap-1 text-xl font-black text-purple-700 dark:text-purple-300">
                <Sparkles size={16} />
                {targetedRead}/{targetedWords.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('game.ai_targeted_read', {}, 'Focus words read')}
              </div>
            </div>
            <div className="rounded-lg bg-purple-100/60 dark:bg-purple-900/30 p-3">
              <div className="text-xl font-black text-purple-700 dark:text-purple-300">
                {targetedRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('game.ai_targeted_rate', {}, 'Focus word rate')}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            {targetedRate >= 80
              ? t('game.ai_great_focus', {}, 'Great job on your focus words! Difficulty will increase next session.')
              : targetedRate >= 50
                ? t('game.ai_keep_going', {}, 'Good progress on focus words. Keep practicing to master them.')
                : t('game.ai_needs_work', {}, 'These words need more practice. AI will prioritize them next session.')}
          </p>
        </motion.div>
      )}

      {/* AI Coaching tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="rounded-xl border p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare size={15} className="text-muted-foreground" />
            {t('game.coaching_title', {}, 'AI Coach')}
          </div>
          {!coachingFetched && (
            <Button variant="outline" size="sm" onClick={fetchCoaching}>
              <Sparkles size={13} className="mr-1.5" />
              {t('game.get_coaching', {}, 'Get feedback')}
            </Button>
          )}
        </div>

        {coachingLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            {t('game.coaching_loading', {}, 'Generating your personalised tip…')}
          </div>
        )}

        {coachingTip && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-foreground leading-relaxed"
          >
            {coachingTip}
          </motion.p>
        )}

        {coachingFetched && !coachingLoading && !coachingTip && (
          <p className="text-xs text-muted-foreground">
            {t('game.coaching_unavailable', {}, 'AI coaching is not available right now.')}
          </p>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="game"
          size="lg"
          className="flex-1"
          onClick={onPlayAgain}
        >
          <RotateCcw size={20} />
          {t('game.play_again', {}, 'Play Again')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => window.history.back()}
        >
          {t('common.back', {}, 'Back')}
        </Button>
      </div>
    </div>
  );
}
