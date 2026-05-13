<?php

namespace Database\Factories;

use App\Enums\AchievementConditionType;
use Illuminate\Database\Eloquent\Factories\Factory;

class AchievementFactory extends Factory
{
    public function definition(): array
    {
        $conditionType = fake()->randomElement([
            'sessions_count', 'wpm_reached', 'streak_days', 'total_words',
            'perfect_session', 'language_master', 'early_bird', 'night_owl',
        ]);

        $conditionValues = [
            'sessions_count' => fake()->randomElement([1, 5, 10, 25, 50, 100]),
            'wpm_reached' => fake()->randomElement([30, 50, 75, 100, 150, 200]),
            'streak_days' => fake()->randomElement([3, 7, 14, 30, 60, 100]),
            'total_words' => fake()->randomElement([100, 500, 1000, 5000, 10000]),
            'perfect_session' => fake()->randomElement([1, 5, 10]),
            'language_master' => 1,
            'early_bird' => 5,
            'night_owl' => 5,
        ];

        $name = fake()->words(2, true);

        return [
            'name_az' => $name . ' (AZ)',
            'name_ru' => $name . ' (RU)',
            'name_en' => $name . ' (EN)',
            'description_az' => fake()->sentence(),
            'description_ru' => fake()->sentence(),
            'description_en' => fake()->sentence(),
            'icon' => fake()->randomElement(['🏆', '⭐', '🔥', '🎯', '💎', '🚀', '📚', '🌟']),
            'xp_reward' => fake()->randomElement([10, 25, 50, 100, 200]),
            'condition_type' => $conditionType,
            'condition_value' => $conditionValues[$conditionType],
            'is_active' => true,
        ];
    }
}
