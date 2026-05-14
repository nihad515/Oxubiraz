<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameSessionResource;
use App\Models\GameSession;
use App\Services\GameService;
use App\Services\OpenAiCoachingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function __construct(
        private readonly GameService $gameService,
        private readonly OpenAiCoachingService $coachingService,
    ) {}

    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:random_words,text_reading,sentence_reading,memory,ai'],
            'duration' => ['required', 'integer', 'in:30,60,90'],
            'language' => ['required', 'in:az,ru,en'],
            'word_count' => ['sometimes', 'integer', 'min:10', 'max:200'],
            'word_list_id' => ['sometimes', 'nullable', 'exists:word_lists,id'],
            'text_id' => ['sometimes', 'nullable', 'exists:reading_texts,id'],
            'difficulty' => ['sometimes', 'in:beginner,elementary,intermediate,advanced,expert'],
        ]);

        $result = $this->gameService->start($validated, $request->user());

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ]);
    }

    public function finish(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:random_words,text_reading,sentence_reading,memory,ai'],
            'duration' => ['required', 'integer', 'in:30,60,90'],
            'language' => ['required', 'in:az,ru,en'],
            'total_words' => ['required', 'integer', 'min:0'],
            'clicked_words' => ['required', 'integer', 'min:0'],
            'accuracy' => ['required', 'numeric', 'min:0', 'max:100'],
            'completion_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'time_elapsed_ms' => ['required', 'integer', 'min:0'],
            'is_completed' => ['required', 'boolean'],
            'word_list_id' => ['sometimes', 'nullable', 'exists:word_lists,id'],
            'text_id' => ['sometimes', 'nullable', 'exists:reading_texts,id'],
        ]);

        $session = $this->gameService->finish($validated, $request->user());

        return response()->json([
            'status' => 'success',
            'data' => new GameSessionResource($session),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $sessions = GameSession::byUser($request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => GameSessionResource::collection($sessions->items()),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    public function results(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'total_sessions' => GameSession::byUser($user->id)->count(),
            'total_words' => GameSession::byUser($user->id)->sum('clicked_words'),
            'best_wpm' => GameSession::byUser($user->id)->max('wpm') ?? 0,
            'average_wpm' => (int) (GameSession::byUser($user->id)->avg('wpm') ?? 0),
            'sessions_today' => GameSession::byUser($user->id)->today()->count(),
            'completion_rate' => $this->calcCompletionRate($user->id),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }

    public function config(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'modes' => ['random_words', 'text_reading', 'sentence_reading', 'memory', 'ai'],
                'durations' => [30, 60, 90],
                'languages' => ['az', 'ru', 'en'],
                'difficulties' => ['beginner', 'elementary', 'intermediate', 'advanced', 'expert'],
                'default_word_count' => 50,
            ],
        ]);
    }

    public function aiCoaching(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wpm'           => ['required', 'integer', 'min:0', 'max:1000'],
            'accuracy'      => ['required', 'integer', 'min:0', 'max:100'],
            'mode'          => ['required', 'in:random_words,text_reading,sentence_reading,memory,ai'],
            'duration'      => ['required', 'integer', 'in:30,60,90'],
            'language'      => ['required', 'in:az,ru,en'],
            'targeted_rate' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
            'top_weak_words'=> ['sometimes', 'array'],
        ]);

        $tip = $this->coachingService->coaching($validated);

        return response()->json([
            'status' => 'success',
            'data'   => ['tip' => $tip],
        ]);
    }

    public function aiProfile(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $this->gameService->aiProfile($request->user()),
        ]);
    }

    public function randomWords(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'language' => ['required', 'in:az,ru,en'],
            'count' => ['sometimes', 'integer', 'min:5', 'max:200'],
            'word_list_id' => ['sometimes', 'exists:word_lists,id'],
            'difficulty' => ['sometimes', 'in:beginner,elementary,intermediate,advanced,expert'],
        ]);

        $result = $this->gameService->start(
            array_merge($validated, ['mode' => 'random_words', 'duration' => 60]),
            $request->user(),
        );

        return response()->json([
            'status' => 'success',
            'data' => ['words' => $result['words']],
        ]);
    }

    private function calcCompletionRate(int $userId): float
    {
        $total = GameSession::byUser($userId)->count();
        if ($total === 0) return 0;
        $completed = GameSession::byUser($userId)->completed()->count();
        return round(($completed / $total) * 100, 1);
    }
}
