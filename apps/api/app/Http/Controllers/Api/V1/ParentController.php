<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    public function children(Request $request): JsonResponse
    {
        $parent = $request->user();

        $children = User::where('parent_id', $parent->id)
            ->with(['roles', 'school', 'schoolClass'])
            ->get()
            ->map(fn ($child) => $this->childSummary($child));

        return response()->json(['status' => 'success', 'data' => $children]);
    }

    public function childStats(Request $request, User $user): JsonResponse
    {
        $parent = $request->user();

        if ($user->parent_id !== $parent->id) {
            return response()->json(['status' => 'error', 'message' => 'Not your child.'], 403);
        }

        $stats = $this->childSummary($user);

        // Add trend data (last 14 days)
        $trend = GameSession::byUser($user->id)
            ->where('created_at', '>=', now()->subDays(14))
            ->selectRaw('DATE(created_at) as date, MAX(wpm) as wpm, COUNT(*) as sessions')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $stats['wpm_trend'] = $trend;

        // Language breakdown
        $byLanguage = GameSession::byUser($user->id)
            ->selectRaw('language, COUNT(*) as sessions, AVG(wpm) as avg_wpm')
            ->groupBy('language')
            ->get();

        $stats['by_language'] = $byLanguage;

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    private function childSummary(User $child): array
    {
        return [
            'id' => $child->id,
            'name' => $child->full_name ?? ($child->first_name . ' ' . $child->last_name),
            'username' => $child->username,
            'level' => $child->level,
            'xp' => $child->xp,
            'streak_days' => $child->streak_days,
            'best_wpm' => GameSession::byUser($child->id)->max('wpm') ?? 0,
            'average_wpm' => (int) (GameSession::byUser($child->id)->avg('wpm') ?? 0),
            'sessions_today' => GameSession::byUser($child->id)->today()->count(),
            'total_sessions' => GameSession::byUser($child->id)->count(),
            'school' => $child->school?->name,
            'class' => $child->schoolClass?->name,
        ];
    }
}
