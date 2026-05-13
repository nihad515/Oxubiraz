<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\StreakMilestone;

class StreakService
{
    public function updateStreak(User $user): void
    {
        $lastPlayed = $user->last_played_at;
        $now = now();

        if (!$lastPlayed) {
            $user->update([
                'streak_days' => 1,
                'last_played_at' => $now,
            ]);
            return;
        }

        $daysDiff = $lastPlayed->diffInDays($now);

        if ($daysDiff === 0) {
            // Same day — no change
            return;
        }

        if ($daysDiff === 1) {
            // Consecutive day
            $newStreak = $user->streak_days + 1;
            $longest = max($newStreak, $user->longest_streak ?? 0);

            $user->update([
                'streak_days' => $newStreak,
                'longest_streak' => $longest,
                'last_played_at' => $now,
            ]);

            // Award streak XP
            $user->addXp(5, "Daily streak day {$newStreak}");

            // Milestone notifications
            if (in_array($newStreak, [3, 7, 14, 30, 60, 100])) {
                $user->notify(new StreakMilestone($newStreak));
                // Bonus XP for milestones
                $user->addXp($newStreak * 2, "Streak milestone: {$newStreak} days");
            }
        } else {
            // Streak broken
            $user->update([
                'streak_days' => 1,
                'last_played_at' => $now,
            ]);
        }
    }
}
