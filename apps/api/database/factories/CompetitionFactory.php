<?php

namespace Database\Factories;

use App\Models\Competition;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompetitionFactory extends Factory
{
    protected $model = Competition::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 week', '+1 week');
        $end = $this->faker->dateTimeBetween($start, '+2 weeks');

        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->sentence(),
            'mode' => $this->faker->randomElement(['random_words', 'text_reading', 'sentence_reading']),
            'language' => $this->faker->randomElement(['az', 'ru', 'en']),
            'duration' => $this->faker->randomElement([30, 60, 120]),
            'starts_at' => $start,
            'ends_at' => $end,
            'is_active' => true,
            'max_participants' => $this->faker->optional(0.4)->numberBetween(10, 100),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 'active',
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDay(),
            'is_active' => true,
        ]);
    }

    public function upcoming(): static
    {
        return $this->state(fn () => [
            'status' => 'upcoming',
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDays(3),
            'is_active' => true,
        ]);
    }

    public function ended(): static
    {
        return $this->state(fn () => [
            'starts_at' => now()->subDays(3),
            'ends_at' => now()->subHour(),
            'is_active' => false,
        ]);
    }
}
