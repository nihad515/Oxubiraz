<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\GameMode;
use App\Enums\Locale;

class GameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'mode',
        'duration',
        'language',
        'total_words',
        'clicked_words',
        'wpm',
        'accuracy',
        'completion_percentage',
        'time_elapsed_ms',
        'is_completed',
        'xp_earned',
        'word_list_id',
        'text_id',
        'word_sequence',
        'click_timestamps',
        'weakest_words',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'mode' => GameMode::class,
            'language' => Locale::class,
            'duration' => 'integer',
            'total_words' => 'integer',
            'clicked_words' => 'integer',
            'wpm' => 'integer',
            'accuracy' => 'decimal:2',
            'completion_percentage' => 'decimal:2',
            'time_elapsed_ms' => 'integer',
            'xp_earned' => 'integer',
            'is_completed' => 'boolean',
            'word_sequence' => 'array',
            'click_timestamps' => 'array',
            'weakest_words' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wordList(): BelongsTo
    {
        return $this->belongsTo(WordList::class);
    }

    public function text(): BelongsTo
    {
        return $this->belongsTo(ReadingText::class, 'text_id');
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    public function scopeByMode($query, string $mode)
    {
        return $query->where('mode', $mode);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public static function calculateWpm(int $wordsRead, int $elapsedMs): int
    {
        if ($elapsedMs === 0) return 0;
        $minutes = $elapsedMs / 1000 / 60;
        return (int) round($wordsRead / $minutes);
    }

    public static function calculateXp(int $wpm, bool $isCompleted, int $duration): int
    {
        $base = 10;
        $wpmBonus = (int) ($wpm / 50);
        $completionBonus = $isCompleted ? 15 : 0;
        $durationBonus = (int) ($duration / 30) * 2;
        return $base + $wpmBonus + $completionBonus + $durationBonus;
    }
}
