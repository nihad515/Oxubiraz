'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, BookOpen, BrainCircuit, AlignLeft, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/use-game';
import { useString } from '@/hooks/use-string';
import { useStringStore } from '@/store/string-store';
import { cn } from '@/lib/utils/cn';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { GameMode, GameDuration, GameConfig as IGameConfig } from '@/types/game';
import type { ApiResponse } from '@/types/api';
import type { WordList } from '@/types/content';

const GAME_MODES: Array<{ mode: GameMode; icon: React.ReactNode; labelKey: string; descKey: string }> = [
  { mode: 'random_words', icon: <Zap size={22} />, labelKey: 'game.random_words', descKey: 'game.random_words_desc' },
  { mode: 'text_reading', icon: <AlignLeft size={22} />, labelKey: 'game.text_reading', descKey: 'game.text_reading_desc' },
  { mode: 'sentence_reading', icon: <BookOpen size={22} />, labelKey: 'game.sentence_reading', descKey: 'game.sentence_reading_desc' },
  { mode: 'memory', icon: <BrainCircuit size={22} />, labelKey: 'game.memory_mode', descKey: 'game.memory_desc' },
  { mode: 'ai', icon: <Sparkles size={22} />, labelKey: 'game.ai_mode', descKey: 'game.ai_desc' },
];

const DURATIONS: GameDuration[] = [30, 60, 90];

export function GameConfig() {
  const { t } = useString();
  const { locale } = useStringStore();
  const { startGame, isStarting } = useGame();

  const [selectedMode, setSelectedMode] = useState<GameMode>('random_words');
  const [selectedDuration, setSelectedDuration] = useState<GameDuration>(60);
  const [selectedWordListId, setSelectedWordListId] = useState<number | undefined>();

  const { data: wordLists } = useQuery({
    queryKey: ['word-lists', locale],
    queryFn: () => apiClient.get<ApiResponse<WordList[]>>(API.words.lists, {
      params: { language: locale, per_page: 50 },
    }),
    select: (d) => d.data,
  });

  const handleStart = () => {
    const config: IGameConfig = {
      mode: selectedMode,
      duration: selectedDuration,
      language: locale as 'az' | 'ru' | 'en',
      word_count: 100,
      word_list_id: selectedWordListId,
    };
    startGame(config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('nav.play')}</h1>
        <p className="text-muted-foreground">{t('game.select_mode')}</p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_MODES.map(({ mode, icon, labelKey, descKey }) => (
          <motion.button
            key={mode}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedMode(mode)}
            className={cn(
              'group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200',
              'touch-manipulation touch-target',
              selectedMode === mode
                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary ring-offset-2'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30',
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
                selectedMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
              )}
            >
              {icon}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="font-semibold">{t(labelKey)}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {t(descKey, {}, '')}
              </div>
            </div>
            {selectedMode === mode && (
              <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Duration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('game.select_duration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setSelectedDuration(dur)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl border py-4 transition-all duration-150',
                  'touch-manipulation touch-target',
                  selectedDuration === dur
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-accent/30',
                )}
              >
                <span className="text-2xl font-black">{dur}</span>
                <span className="text-xs font-medium opacity-80">
                  {t('game.seconds', {}, 'sec')}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Word list selector */}
      {(selectedMode === 'random_words' || selectedMode === 'sentence_reading') && wordLists && wordLists.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('game.word_list', {}, 'Word List')}</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedWordListId ?? ''}
              onChange={(e) => setSelectedWordListId(e.target.value ? Number(e.target.value) : undefined)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{t('game.auto_select', {}, 'Auto-select')}</option>
              {wordLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.words_count} {t('game.words', {}, 'words')})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Start button */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          variant="game"
          size="xl"
          className="w-full text-lg font-bold"
          onClick={handleStart}
          loading={isStarting}
        >
          <Zap size={22} />
          {t('game.start')}
        </Button>
      </motion.div>
    </div>
  );
}
