<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('Password@123'),
            'locale' => fake()->randomElement(['az', 'ru', 'en']),
            'is_active' => true,
            'xp' => 0,
            'level' => 1,
            'streak_days' => 0,
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function student(): static
    {
        return $this->afterCreating(fn ($user) => $user->assignRole(UserRole::Student->value));
    }

    public function teacher(): static
    {
        return $this->afterCreating(fn ($user) => $user->assignRole(UserRole::Teacher->value));
    }

    public function parent(): static
    {
        return $this->afterCreating(fn ($user) => $user->assignRole(UserRole::Parent->value));
    }

    public function admin(): static
    {
        return $this->afterCreating(fn ($user) => $user->assignRole(UserRole::Admin->value));
    }

    public function withXp(int $xp): static
    {
        $level = 1;
        $thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000, 22000];
        foreach ($thresholds as $i => $threshold) {
            if ($xp >= $threshold) $level = $i + 1;
        }
        return $this->state(fn () => ['xp' => $xp, 'level' => $level]);
    }
}
