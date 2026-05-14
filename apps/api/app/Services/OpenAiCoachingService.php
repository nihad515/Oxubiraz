<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use OpenAI\Laravel\Facades\OpenAI;
use Throwable;

class OpenAiCoachingService
{
    private const CACHE_TTL = 86400; // 24 hours
    private const MODEL     = 'gpt-4o-mini';
    private const MAX_TOKENS = 120;

    /**
     * Generate a short personalized coaching tip after a game session.
     * Results are cached by a performance bucket key to limit API calls.
     *
     * @param  array{
     *   wpm: int,
     *   accuracy: int,
     *   mode: string,
     *   duration: int,
     *   language: string,
     *   targeted_rate: int|null,
     *   top_weak_words: string[],
     * } $stats
     */
    public function coaching(array $stats): ?string
    {
        if (empty(config('openai.api_key'))) {
            return null;
        }

        $cacheKey = $this->bucketKey($stats);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($stats) {
            return $this->generate($stats);
        });
    }

    private function generate(array $stats): ?string
    {
        try {
            $prompt = $this->buildPrompt($stats);

            $response = OpenAI::chat()->create([
                'model'      => self::MODEL,
                'max_tokens' => self::MAX_TOKENS,
                'messages'   => [
                    ['role' => 'system', 'content' => $this->systemPrompt($stats['language'])],
                    ['role' => 'user',   'content' => $prompt],
                ],
                'temperature' => 0.7,
            ]);

            return trim($response->choices[0]->message->content ?? '');
        } catch (Throwable) {
            return null;
        }
    }

    private function systemPrompt(string $language): string
    {
        $instructions = match ($language) {
            'az' => 'Sən sürətli oxu məşqçisisən. Qısa, həvəsləndirici Azərbaycan dilində məsləhət ver (2-3 cümlə).',
            'ru' => 'Ты тренер по скорочтению. Дай короткий, мотивирующий совет на русском языке (2-3 предложения).',
            default => 'You are a reading-speed coach. Give a short, encouraging tip in English (2-3 sentences).',
        };

        return $instructions . ' Do not use markdown. Do not mention the platform name. Keep it personal and actionable.';
    }

    private function buildPrompt(array $stats): string
    {
        $mode         = $stats['mode'];
        $wpm          = $stats['wpm'];
        $accuracy     = $stats['accuracy'];
        $duration     = $stats['duration'];
        $targetedRate = $stats['targeted_rate'] ?? null;
        $weakWords    = implode(', ', array_slice($stats['top_weak_words'] ?? [], 0, 5));

        $lines = [
            "Session: mode={$mode}, duration={$duration}s, WPM={$wpm}, completion={$accuracy}%",
        ];

        if ($targetedRate !== null) {
            $lines[] = "AI focus-word hit rate: {$targetedRate}%";
        }

        if ($weakWords) {
            $lines[] = "Struggling words: {$weakWords}";
        }

        $lines[] = 'Give a personalised 2-3 sentence coaching tip based on these results.';

        return implode("\n", $lines);
    }

    /**
     * Bucket key buckets performance into coarse bands so similar sessions
     * share one cached tip instead of hitting the API every time.
     */
    private function bucketKey(array $stats): string
    {
        $wpmBucket      = (int) floor($stats['wpm'] / 20) * 20;     // 0,20,40,60…
        $accBucket      = (int) floor($stats['accuracy'] / 10) * 10; // 0,10,20…
        $targetedBucket = $stats['targeted_rate'] !== null
            ? (int) floor($stats['targeted_rate'] / 20) * 20
            : 'na';

        return "ai_coaching:{$stats['language']}:{$stats['mode']}:{$wpmBucket}:{$accBucket}:{$targetedBucket}";
    }
}
