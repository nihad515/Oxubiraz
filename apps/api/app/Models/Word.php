<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Locale;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'word_list_id',
        'text',
        'language',
        'syllable_count',
        'frequency',
    ];

    protected function casts(): array
    {
        return [
            'language' => Locale::class,
            'syllable_count' => 'integer',
            'frequency' => 'integer',
        ];
    }

    public function wordList(): BelongsTo
    {
        return $this->belongsTo(WordList::class);
    }
}
