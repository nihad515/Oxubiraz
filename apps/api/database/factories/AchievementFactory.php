<?php

namespace Database\Factories;

use App\Enums\AchievementConditionType;
use Illuminate\Database\Eloquent\Factories\Factory;

class AchievementFactory extends Factory
{
    public function definition(): array
    {
        $conditionType = fake()->randomElement(AchievementConditionType::cases())->value;

        $conditionValues = [
            AchievementConditionType::WpmReached->value        => fake()->randomElement([30, 50, 75, 100, 150, 200]),
            AchievementConditionType::SessionsCompleted->value => fake()->randomElement([1, 5, 10, 25, 50, 100]),
            AchievementConditionType::StreakDays->value        => fake()->randomElement([3, 7, 14, 30, 60, 100]),
            AchievementConditionType::WordsRead->value         => fake()->randomElement([100, 500, 1000, 5000, 10000]),
            AchievementConditionType::PerfectSession->value    => fake()->randomElement([1, 5, 10]),
            AchievementConditionType::LanguageMastery->value   => 1,
            AchievementConditionType::FirstSession->value      => 1,
            AchievementConditionType::LevelReached->value      => fake()->randomElement([5, 10, 20, 50]),
        ];

        $name = fake()->words(2, true);

        return [
            'name_az'         => $name . ' (AZ)',
            'name_ru'         => $name . ' (RU)',
            'name_en'         => $name . ' (EN)',
            'description_az'  => fake()->sentence(),
            'description_ru'  => fake()->sentence(),
            'description_en'  => fake()->sentence(),
            'icon'            => fake()->randomElement(['🏆', '⭐', '🔥', '🎯', '💎', '🚀', '📚', '🌟']),
            'xp_reward'       => fake()->randomElement([10, 25, 50, 100, 200]),
            'condition_type'  => $conditionType,
            'condition_value' => $conditionValues[$conditionType],
            'is_active'       => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
