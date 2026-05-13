<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Notifications\AchievementEarned;

class AchievementService
{
    public function checkAchievements(User $user): array
    {
        $earned = [];
        $existingIds = $user->achievements()->pluck('achievements.id');

        $achievements = Achievement::where('is_active', true)
            ->whereNotIn('id', $existingIds)
            ->get();

        foreach ($achievements as $achievement) {
            if ($achievement->checkCondition($user)) {
                $user->achievements()->attach($achievement->id, [
                    'earned_at' => now(),
                ]);

                $user->addXp($achievement->xp_reward, "Achievement: {$achievement->key}");
                $user->notify(new AchievementEarned($achievement));

                $earned[] = $achievement;
            }
        }

        return $earned;
    }
}
