'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type { Achievement } from '@/types/gamification';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function AchievementsPage() {
  const { t } = useString();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', 'all'],
    queryFn: () => apiClient.get<ApiResponse<Achievement[]>>(API.achievements.list),
    select: (d) => d.data,
  });

  const earned = achievements?.filter(a => a.is_earned) ?? [];
  const locked = achievements?.filter(a => !a.is_earned) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={24} className="text-yellow-500" />
          {t('nav.achievements', {}, 'Achievements')}
        </h1>
        <p className="text-muted-foreground">
          {t('achievements.progress', { earned: earned.length, total: achievements?.length ?? 0 },
            `${earned.length} of ${achievements?.length ?? 0} earned`)}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <>
          {earned.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('achievements.earned', {}, 'Earned')} ({earned.length})
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {earned.map((achievement) => (
                  <motion.div key={achievement.id} variants={itemVariants}>
                    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-background dark:border-yellow-800 dark:from-yellow-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold truncate">{achievement.name}</span>
                              <Badge variant="gold" className="text-xs">+{achievement.xp_reward} XP</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                            {achievement.earned_at && (
                              <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                {new Date(achievement.earned_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {locked.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('achievements.locked', {}, 'Locked')} ({locked.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locked.map((achievement) => (
                  <Card key={achievement.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl grayscale">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold truncate">{achievement.name}</span>
                            <Badge variant="secondary" className="text-xs">+{achievement.xp_reward} XP</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {!achievements?.length && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Trophy size={40} className="mx-auto mb-3 opacity-20" />
                <p>{t('achievements.empty', {}, 'No achievements yet. Start playing!')}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
