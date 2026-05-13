<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'mode' => $this->mode,
            'duration' => $this->duration,
            'language' => $this->language,
            'total_words' => $this->total_words,
            'clicked_words' => $this->clicked_words,
            'wpm' => $this->wpm,
            'accuracy' => $this->accuracy,
            'completion_percentage' => $this->completion_percentage,
            'time_elapsed_ms' => $this->time_elapsed_ms,
            'is_completed' => $this->is_completed,
            'xp_earned' => $this->xp_earned,
            'word_list_id' => $this->word_list_id,
            'text_id' => $this->text_id,
            'started_at' => $this->started_at?->toIso8601String(),
            'finished_at' => $this->finished_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
