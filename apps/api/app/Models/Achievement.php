<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Enums\AchievementConditionType;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name_az',
        'name_ru',
        'name_en',
        'description_az',
        'description_ru',
        'description_en',
        'icon',
        'badge_color',
        'xp_reward',
        'condition_type',
        'condition_value',
        'is_secret',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'condition_type' => AchievementConditionType::class,
            'condition_value' => 'integer',
            'xp_reward' => 'integer',
            'is_secret' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('earned_at')
            ->withTimestamps();
    }

    public function getNameAttribute(): string
    {
        $locale = app()->getLocale();
        return $this->{"name_{$locale}"} ?? $this->name_az;
    }

    public function getDescriptionAttribute(): string
    {
        $locale = app()->getLocale();
        return $this->{"description_{$locale}"} ?? $this->description_az;
    }

    public function checkCondition(User $user): bool
    {
        return match ($this->condition_type) {
            AchievementConditionType::WpmReached =>
                $user->gameSessions()->max('wpm') >= $this->condition_value,
            AchievementConditionType::SessionsCompleted =>
                $user->gameSessions()->completed()->count() >= $this->condition_value,
            AchievementConditionType::StreakDays =>
                $user->streak_days >= $this->condition_value,
            AchievementConditionType::WordsRead =>
                $user->gameSessions()->sum('clicked_words') >= $this->condition_value,
            AchievementConditionType::LevelReached =>
                $user->level >= $this->condition_value,
            default => false,
        };
    }
}
