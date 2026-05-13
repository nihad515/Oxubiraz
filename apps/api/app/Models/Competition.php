<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Enums\GameMode;
use App\Enums\Locale;

class Competition extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'mode',
        'language',
        'duration',
        'word_list_id',
        'text_id',
        'school_id',
        'class_id',
        'created_by',
        'starts_at',
        'ends_at',
        'is_active',
        'max_participants',
    ];

    protected function casts(): array
    {
        return [
            'mode' => GameMode::class,
            'language' => Locale::class,
            'duration' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'max_participants' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function wordList(): BelongsTo
    {
        return $this->belongsTo(WordList::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'competition_participants')
            ->withPivot(['joined_at', 'wpm', 'score', 'rank', 'completed_at'])
            ->withTimestamps();
    }

    public function isActive(): bool
    {
        $now = now();
        return $this->is_active
            && $now->gte($this->starts_at)
            && $now->lte($this->ends_at);
    }

    public function hasEnded(): bool
    {
        return now()->gt($this->ends_at);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }
}
