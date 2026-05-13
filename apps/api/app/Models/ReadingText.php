<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\DifficultyLevel;
use App\Enums\AgeGroup;
use App\Enums\Locale;

class ReadingText extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'language',
        'difficulty',
        'age_group',
        'word_count',
        'category',
        'tags',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'language' => Locale::class,
            'difficulty' => DifficultyLevel::class,
            'age_group' => AgeGroup::class,
            'word_count' => 'integer',
            'is_active' => 'boolean',
            'tags' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ReadingText $text) {
            $text->word_count = str_word_count($text->content);
        });

        static::updating(function (ReadingText $text) {
            if ($text->isDirty('content')) {
                $text->word_count = str_word_count($text->content);
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class, 'text_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    public function scopeByDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeByAgeGroup($query, string $ageGroup)
    {
        return $query->where('age_group', $ageGroup);
    }

    public function toWordArray(): array
    {
        return preg_split('/\s+/', trim($this->content)) ?: [];
    }
}
