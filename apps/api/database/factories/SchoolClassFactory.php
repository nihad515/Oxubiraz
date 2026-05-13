<?php

namespace Database\Factories;

use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'name' => $this->faker->randomElement(['1A', '1B', '2A', '2B', '3A', '3B', '4A', '5A', '6B', '7A']),
            'grade' => $this->faker->numberBetween(1, 11),
        ];
    }
}
