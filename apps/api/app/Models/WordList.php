<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\DifficultyLevel;
use App\Enums\AgeGroup;
use App\Enums\Locale;

class WordList extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'language',
        'difficulty',
        'age_group',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'language' => Locale::class,
            'difficulty' => DifficultyLevel::class,
            'age_group' => AgeGroup::class,
            'is_active' => 'boolean',
        ];
    }

    public function words(): HasMany
    {
        return $this->hasMany(Word::class);
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    public function getRandomWords(int $count): array
    {
        return $this->words()
            ->inRandomOrder()
            ->limit($count)
            ->pluck('text')
            ->toArray();
    }
}
