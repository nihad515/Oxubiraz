<?php

namespace Database\Factories;

use App\Models\WordList;
use Illuminate\Database\Eloquent\Factories\Factory;

class WordFactory extends Factory
{
    public function definition(): array
    {
        $prefixes = ['alma', 'arpa', 'bağ', 'çay', 'daş', 'ev', 'gün', 'hava', 'kənd', 'su'];

        return [
            'word_list_id'   => WordList::factory(),
            'text'           => fake()->randomElement($prefixes) . fake()->numerify('##'),
            'syllable_count' => fake()->numberBetween(1, 4),
            'frequency'      => fake()->numberBetween(1, 100),
        ];
    }
}
