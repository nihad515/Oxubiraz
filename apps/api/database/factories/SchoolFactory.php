<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolFactory extends Factory
{
    public function definition(): array
    {
        $cities = ['Bakı', 'Gəncə', 'Sumqayıt', 'Mingəçevir', 'Lənkəran', 'Şirvan'];

        return [
            'name' => fake()->company() . ' School',
            'city' => fake()->randomElement($cities),
            'address' => fake()->address(),
            'phone' => '+994' . fake()->numerify('#########'),
            'email' => fake()->companyEmail(),
            'is_active' => true,
        ];
    }
}
