<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GameSessionFactory extends Factory
{
    public function definition(): array
    {
        $duration = fake()->randomElement([30, 60, 90]);
        $totalWords = fake()->numberBetween(20, 200);
        $clickedWords = fake()->numberBetween(0, $totalWords);
        $elapsedMs = fake()->numberBetween($duration * 500, $duration * 1000);
        $wpm = $elapsedMs > 0 ? (int) round(($clickedWords / ($elapsedMs / 1000)) * 60) : 0;

        return [
            'user_id' => User::factory(),
            'mode' => fake()->randomElement(['random_words', 'text_reading', 'sentence_reading', 'memory']),
            'duration' => $duration,
            'language' => fake()->randomElement(['az', 'ru', 'en']),
            'total_words' => $totalWords,
            'clicked_words' => $clickedWords,
            'wpm' => $wpm,
            'accuracy' => fake()->randomFloat(1, 70, 100),
            'completion_percentage' => $totalWords > 0 ? round(($clickedWords / $totalWords) * 100, 1) : 0,
            'time_elapsed_ms' => $elapsedMs,
            'is_completed' => $clickedWords >= $totalWords,
            'xp_earned' => fake()->numberBetween(0, 50),
            'started_at' => now()->subSeconds($duration + 5),
            'finished_at' => now(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attrs) => [
            'is_completed' => true,
            'completion_percentage' => 100,
            'clicked_words' => $attrs['total_words'],
        ]);
    }

    public function forUser(User $user): static
    {
        return $this->state(fn () => ['user_id' => $user->id]);
    }
}
