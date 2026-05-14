<?php

namespace App\Services;

use App\Models\GameSession;
use App\Models\User;
use App\Models\WordList;
use App\Models\ReadingText;
use App\Enums\GameMode;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GameService
{
    private array $lastTargetedWords = [];

    public function __construct(
        private readonly AchievementService $achievementService,
        private readonly StreakService $streakService,
    ) {}

    public function start(array $config, User $user): array
    {
        $this->lastTargetedWords = [];
        $words = $this->resolveWords($config, $user);

        if (empty($words)) {
            throw ValidationException::withMessages([
                'config' => ['No words available for the selected configuration.'],
            ]);
        }

        $result = [
            'session_id' => Str::uuid()->toString(),
            'words' => $words,
            'config' => $config,
        ];

        if (GameMode::from($config['mode']) === GameMode::Ai) {
            $result['targeted_words'] = $this->lastTargetedWords;
        }

        return $result;
    }

    public function aiProfile(User $user): array
    {
        $recentSessions = GameSession::where('user_id', $user->id)
            ->whereNotNull('weakest_words')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $weakWordCounts = $recentSessions
            ->flatMap(fn($s) => $s->weakest_words ?? [])
            ->countBy()
            ->sortDesc();

        return [
            'weak_words_available' => $weakWordCounts->count(),
            'recent_sessions'      => GameSession::where('user_id', $user->id)->count(),
            'is_personalized'      => $weakWordCounts->count() >= 5,
            'top_weak_words'       => $weakWordCounts->keys()->take(8)->values()->toArray(),
        ];
    }

    public function finish(array $data, User $user): GameSession
    {
        $wpm = GameSession::calculateWpm(
            $data['clicked_words'],
            $data['time_elapsed_ms'],
        );

        $xpEarned = GameSession::calculateXp(
            $wpm,
            $data['is_completed'],
            $data['duration'],
        );

        $session = GameSession::create([
            'user_id' => $user->id,
            'mode' => $data['mode'],
            'duration' => $data['duration'],
            'language' => $data['language'],
            'total_words' => $data['total_words'],
            'clicked_words' => $data['clicked_words'],
            'wpm' => $wpm,
            'accuracy' => $data['accuracy'],
            'completion_percentage' => $data['completion_percentage'],
            'time_elapsed_ms' => $data['time_elapsed_ms'],
            'is_completed' => $data['is_completed'],
            'xp_earned' => $xpEarned,
            'word_list_id' => $data['word_list_id'] ?? null,
            'text_id' => $data['text_id'] ?? null,
            'started_at' => now()->subMilliseconds($data['time_elapsed_ms']),
            'finished_at' => now(),
        ]);

        // Award XP
        $user->addXp($xpEarned, "Game session #{$session->id}");

        // Update streak
        $this->streakService->updateStreak($user);

        // Check achievements
        $this->achievementService->checkAchievements($user);

        return $session;
    }

    private function resolveWords(array $config, User $user): array
    {
        $mode = GameMode::from($config['mode']);
        $language = $config['language'];
        $count = $config['word_count'] ?? 50;

        return match ($mode) {
            GameMode::RandomWords => $this->getRandomWords($config, $language, $count),
            GameMode::TextReading => $this->getTextWords($config),
            GameMode::SentenceReading => $this->getSentenceWords($config, $language),
            GameMode::Memory => $this->getRandomWords($config, $language, min($count, 20)),
            GameMode::Ai => $this->getAiWords($config, $user, $language),
        };
    }

    private function getRandomWords(array $config, string $language, int $count): array
    {
        $query = WordList::active()->byLanguage($language);

        if (!empty($config['word_list_id'])) {
            $query->where('id', $config['word_list_id']);
        }

        if (!empty($config['difficulty'])) {
            $query->where('difficulty', $config['difficulty']);
        }

        $list = $query->first();

        if (!$list) {
            // Fallback: get any active word list for this language
            $list = WordList::active()->byLanguage($language)->first();
        }

        return $list?->getRandomWords($count) ?? [];
    }

    private function getTextWords(array $config): array
    {
        if (empty($config['text_id'])) return [];

        $text = ReadingText::active()->find($config['text_id']);
        return $text?->toWordArray() ?? [];
    }

    private function getSentenceWords(array $config, string $language): array
    {
        return $this->getRandomWords($config, $language, $config['word_count'] ?? 30);
    }

    private function getAiWords(array $config, User $user, string $language): array
    {
        $count = $config['word_count'] ?? 50;

        $weakWords = GameSession::where('user_id', $user->id)
            ->whereNotNull('weakest_words')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->flatMap(fn($s) => $s->weakest_words ?? [])
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take((int) ($count * 0.6)) // up to 60 % targeted
            ->toArray();

        $this->lastTargetedWords = $weakWords;

        $needed = $count - count($weakWords);
        if ($needed > 0) {
            $filler = $this->getRandomWords($config, $language, $needed + 10);
            // Remove duplicates with targeted set
            $targetedSet = array_flip($weakWords);
            $filler = array_values(array_filter($filler, fn($w) => !isset($targetedSet[$w])));
            $weakWords = array_merge($weakWords, array_slice($filler, 0, $needed));
        }

        shuffle($weakWords);
        return array_slice($weakWords, 0, $count);
    }
}
