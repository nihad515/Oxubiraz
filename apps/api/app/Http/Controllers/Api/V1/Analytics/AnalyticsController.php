<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\User;
use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function myStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessions = GameSession::byUser($user->id);

        $stats = [
            'total_sessions' => (clone $sessions)->count(),
            'total_words_read' => (clone $sessions)->sum('clicked_words'),
            'average_wpm' => (int) ((clone $sessions)->avg('wpm') ?? 0),
            'best_wpm' => (clone $sessions)->max('wpm') ?? 0,
            'total_time_minutes' => (int) (((clone $sessions)->sum('time_elapsed_ms')) / 60000),
            'current_streak' => $user->streak_days,
            'longest_streak' => $user->longest_streak,
            'xp_total' => $user->xp,
            'level' => $user->level,
            'sessions_today' => (clone $sessions)->today()->count(),
            'wpm_trend' => $this->getWpmTrend($user->id),
        ];

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function overview(Request $request): JsonResponse
    {
        $data = [
            'total_students' => User::role('student')->active()->count(),
            'total_teachers' => User::role('teacher')->active()->count(),
            'total_sessions_today' => GameSession::whereDate('created_at', today())->count(),
            'total_sessions_this_month' => GameSession::whereMonth('created_at', now()->month)->count(),
            'avg_wpm_today' => (int) (GameSession::whereDate('created_at', today())->avg('wpm') ?? 0),
            'avg_wpm_this_month' => (int) (GameSession::whereMonth('created_at', now()->month)->avg('wpm') ?? 0),
            'top_students' => $this->getTopStudents(5),
        ];

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function studentStats(Request $request, User $user): JsonResponse
    {
        $this->authorize('view_statistics', $user);

        $sessions = GameSession::byUser($user->id);

        $stats = [
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'username' => $user->username,
                'xp' => $user->xp,
                'level' => $user->level,
                'streak_days' => $user->streak_days,
            ],
            'total_sessions' => (clone $sessions)->count(),
            'average_wpm' => (int) ((clone $sessions)->avg('wpm') ?? 0),
            'best_wpm' => (clone $sessions)->max('wpm') ?? 0,
            'total_words_read' => (clone $sessions)->sum('clicked_words'),
            'completion_rate' => $this->getCompletionRate($user->id),
            'by_language' => $this->getStatsByLanguage($user->id),
            'wpm_trend' => $this->getWpmTrend($user->id, 30),
        ];

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function daily(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);

        $stats = GameSession::selectRaw('DATE(created_at) as date, COUNT(*) as sessions, AVG(wpm) as avg_wpm, SUM(clicked_words) as total_words, COUNT(DISTINCT user_id) as active_students')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function monthly(Request $request): JsonResponse
    {
        $stats = GameSession::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as sessions, AVG(wpm) as avg_wpm, SUM(clicked_words) as total_words')
            ->where('created_at', '>=', now()->subYear())
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get();

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function yearly(Request $request): JsonResponse
    {
        $stats = GameSession::selectRaw('YEAR(created_at) as year, COUNT(*) as sessions, AVG(wpm) as avg_wpm, COUNT(DISTINCT user_id) as students_active')
            ->groupByRaw('YEAR(created_at)')
            ->orderByRaw('YEAR(created_at)')
            ->get();

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function byLanguage(Request $request): JsonResponse
    {
        $stats = GameSession::selectRaw('language, COUNT(*) as sessions, AVG(wpm) as avg_wpm')
            ->groupBy('language')
            ->get()
            ->map(function ($row) {
                $total = GameSession::count();
                return [
                    'language' => $row->language,
                    'sessions' => $row->sessions,
                    'avg_wpm' => (int) $row->avg_wpm,
                    'percentage' => $total > 0 ? round(($row->sessions / $total) * 100, 1) : 0,
                ];
            });

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function byMode(Request $request): JsonResponse
    {
        $stats = GameSession::selectRaw('mode, COUNT(*) as sessions, AVG(wpm) as avg_wpm, AVG(completion_percentage) as completion_rate')
            ->groupBy('mode')
            ->get();

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function weakestWords(Request $request): JsonResponse
    {
        $userId = $request->integer('user_id') ?: null;

        $query = GameSession::whereNotNull('weakest_words');
        if ($userId) $query->where('user_id', $userId);

        $sessions = $query->select('weakest_words')->limit(100)->get();

        $wordFreq = [];
        foreach ($sessions as $session) {
            foreach ($session->weakest_words ?? [] as $word) {
                $wordFreq[$word] = ($wordFreq[$word] ?? 0) + 1;
            }
        }

        arsort($wordFreq);
        $top = array_slice($wordFreq, 0, 20, true);

        $result = array_map(
            fn($word, $count) => ['word' => $word, 'occurrence_count' => $count],
            array_keys($top),
            array_values($top),
        );

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function topStudents(Request $request): JsonResponse
    {
        $data = $this->getTopStudents($request->integer('limit', 10));
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function schoolStats(Request $request, School $school): JsonResponse
    {
        $studentIds = $school->students()->pluck('users.id');

        $stats = [
            'school' => ['id' => $school->id, 'name' => $school->name],
            'students_count' => $studentIds->count(),
            'avg_wpm' => (int) (GameSession::whereIn('user_id', $studentIds)->avg('wpm') ?? 0),
            'total_sessions' => GameSession::whereIn('user_id', $studentIds)->count(),
            'top_students' => User::whereIn('id', $studentIds)->orderByDesc('xp')->limit(5)->get(['id', 'first_name', 'last_name', 'username', 'xp', 'level']),
        ];

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function classStats(Request $request, SchoolClass $class): JsonResponse
    {
        $studentIds = $class->students()->pluck('id');

        $stats = [
            'class' => ['id' => $class->id, 'name' => $class->name],
            'students_count' => $studentIds->count(),
            'avg_wpm' => (int) (GameSession::whereIn('user_id', $studentIds)->avg('wpm') ?? 0),
            'total_sessions' => GameSession::whereIn('user_id', $studentIds)->count(),
        ];

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function export(Request $request): mixed
    {
        $format = $request->input('format', 'csv');
        $sessions = GameSession::with('user:id,username,first_name,last_name')
            ->orderByDesc('created_at')
            ->limit(10000)
            ->get();

        return response()->streamDownload(function () use ($sessions) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'username', 'mode', 'language', 'wpm', 'clicked_words', 'total_words', 'completion_%', 'xp_earned', 'created_at']);
            foreach ($sessions as $s) {
                fputcsv($out, [
                    $s->id, $s->user?->username, $s->mode, $s->language,
                    $s->wpm, $s->clicked_words, $s->total_words, $s->completion_percentage,
                    $s->xp_earned, $s->created_at->toIso8601String(),
                ]);
            }
            fclose($out);
        }, 'analytics.csv', ['Content-Type' => 'text/csv']);
    }

    private function getWpmTrend(int $userId, int $limit = 10): array
    {
        return GameSession::byUser($userId)
            ->select(['wpm', 'mode', 'language', DB::raw('DATE(created_at) as date')])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values()
            ->toArray();
    }

    private function getTopStudents(int $limit): array
    {
        return User::role('student')
            ->active()
            ->select(['id', 'first_name', 'last_name', 'username', 'xp', 'level', 'streak_days'])
            ->orderByDesc('xp')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function getCompletionRate(int $userId): float
    {
        $total = GameSession::byUser($userId)->count();
        if ($total === 0) return 0;
        $completed = GameSession::byUser($userId)->completed()->count();
        return round(($completed / $total) * 100, 1);
    }

    private function getStatsByLanguage(int $userId): array
    {
        return GameSession::byUser($userId)
            ->selectRaw('language, COUNT(*) as sessions, AVG(wpm) as avg_wpm')
            ->groupBy('language')
            ->get()
            ->toArray();
    }
}
