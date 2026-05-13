<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WordListFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'language' => fake()->randomElement(['az', 'ru', 'en']),
            'difficulty' => fake()->randomElement(['beginner', 'elementary', 'intermediate', 'advanced', 'expert']),
            'age_group' => fake()->randomElement(['5-7', '8-10', '11-13', '14-16', '16+']),
            'is_active' => true,
        ];
    }
}
