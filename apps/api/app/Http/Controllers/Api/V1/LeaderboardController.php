<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function global(Request $request): JsonResponse
    {
        $type = $request->query('type', 'xp'); // xp | wpm | sessions
        $period = $request->query('period', 'all'); // all | week | month
        $locale = $request->query('language');

        $cacheKey = "leaderboard.global.{$type}.{$period}" . ($locale ? ".{$locale}" : '');

        $data = Cache::remember($cacheKey, 300, function () use ($type, $period, $locale) {
            return match ($type) {
                'wpm' => $this->wpmLeaderboard($period, $locale),
                'sessions' => $this->sessionsLeaderboard($period, $locale),
                default => $this->xpLeaderboard(),
            };
        });

        $authUserId = $request->user()->id;
        $myRank = collect($data)->search(fn ($entry) => $entry['user_id'] === $authUserId);

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'meta' => [
                'my_rank' => $myRank !== false ? $myRank + 1 : null,
                'type' => $type,
                'period' => $period,
            ],
        ]);
    }

    public function school(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->school_id) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $cacheKey = "leaderboard.school.{$user->school_id}";

        $data = Cache::remember($cacheKey, 300, function () use ($user) {
            return User::bySchool($user->school_id)
                ->byRole('student')
                ->orderByDesc('xp')
                ->limit(50)
                ->get()
                ->map(fn ($u, $i) => [
                    'rank' => $i + 1,
                    'user_id' => $u->id,
                    'name' => $u->full_name,
                    'avatar' => $u->getFirstMediaUrl('avatar', 'thumb'),
                    'xp' => $u->xp,
                    'level' => $u->level,
                ]);
        });

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function class(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->class_id) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $data = User::where('class_id', $user->class_id)
            ->byRole('student')
            ->orderByDesc('xp')
            ->get()
            ->map(fn ($u, $i) => [
                'rank' => $i + 1,
                'user_id' => $u->id,
                'name' => $u->full_name,
                'avatar' => $u->getFirstMediaUrl('avatar', 'thumb'),
                'xp' => $u->xp,
                'level' => $u->level,
            ]);

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    private function xpLeaderboard(): array
    {
        return User::byRole('student')
            ->active()
            ->orderByDesc('xp')
            ->limit(100)
            ->get()
            ->map(fn ($u, $i) => [
                'rank' => $i + 1,
                'user_id' => $u->id,
                'name' => $u->full_name,
                'avatar' => $u->getFirstMediaUrl('avatar', 'thumb'),
                'xp' => $u->xp,
                'level' => $u->level,
            ])
            ->toArray();
    }

    private function wpmLeaderboard(string $period, ?string $locale): array
    {
        $query = DB::table('game_sessions')
            ->join('users', 'game_sessions.user_id', '=', 'users.id')
            ->select(
                'game_sessions.user_id',
                DB::raw('CONCAT(users.first_name, " ", users.last_name) as name'),
                DB::raw('MAX(game_sessions.wpm) as best_wpm'),
                'users.xp',
                'users.level'
            )
            ->where('game_sessions.is_completed', true)
            ->whereNull('users.deleted_at');

        if ($period === 'week') {
            $query->where('game_sessions.created_at', '>=', now()->startOfWeek());
        } elseif ($period === 'month') {
            $query->where('game_sessions.created_at', '>=', now()->startOfMonth());
        }

        if ($locale) {
            $query->where('game_sessions.language', $locale);
        }

        return $query->groupBy('game_sessions.user_id', 'users.first_name', 'users.last_name', 'users.xp', 'users.level')
            ->orderByDesc('best_wpm')
            ->limit(100)
            ->get()
            ->map(fn ($row, $i) => [
                'rank' => $i + 1,
                'user_id' => $row->user_id,
                'name' => $row->name,
                'avatar' => null,
                'best_wpm' => $row->best_wpm,
                'xp' => $row->xp,
                'level' => $row->level,
            ])
            ->toArray();
    }

    private function sessionsLeaderboard(string $period, ?string $locale): array
    {
        $query = DB::table('game_sessions')
            ->join('users', 'game_sessions.user_id', '=', 'users.id')
            ->select(
                'game_sessions.user_id',
                DB::raw('CONCAT(users.first_name, " ", users.last_name) as name'),
                DB::raw('COUNT(game_sessions.id) as session_count'),
                'users.xp',
                'users.level'
            )
            ->whereNull('users.deleted_at');

        if ($period === 'week') {
            $query->where('game_sessions.created_at', '>=', now()->startOfWeek());
        } elseif ($period === 'month') {
            $query->where('game_sessions.created_at', '>=', now()->startOfMonth());
        }

        if ($locale) {
            $query->where('game_sessions.language', $locale);
        }

        return $query->groupBy('game_sessions.user_id', 'users.first_name', 'users.last_name', 'users.xp', 'users.level')
            ->orderByDesc('session_count')
            ->limit(100)
            ->get()
            ->map(fn ($row, $i) => [
                'rank' => $i + 1,
                'user_id' => $row->user_id,
                'name' => $row->name,
                'avatar' => null,
                'session_count' => $row->session_count,
                'xp' => $row->xp,
                'level' => $row->level,
            ])
            ->toArray();
    }
}
