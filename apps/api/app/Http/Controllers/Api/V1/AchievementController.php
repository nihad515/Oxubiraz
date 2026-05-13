<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $locale = $request->header('Accept-Language', 'az');
        $user = $request->user();

        $achievements = Achievement::active()
            ->get()
            ->map(function ($achievement) use ($locale, $user) {
                $earned = $user->achievements()->where('achievement_id', $achievement->id)->first();
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->{"name_{$locale}"} ?? $achievement->name_az,
                    'description' => $achievement->{"description_{$locale}"} ?? $achievement->description_az,
                    'icon' => $achievement->icon,
                    'xp_reward' => $achievement->xp_reward,
                    'condition_type' => $achievement->condition_type,
                    'condition_value' => $achievement->condition_value,
                    'is_earned' => !is_null($earned),
                    'earned_at' => $earned?->pivot->earned_at,
                ];
            });

        return response()->json(['status' => 'success', 'data' => $achievements]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_az' => ['required', 'string', 'max:255'],
            'name_ru' => ['required', 'string', 'max:255'],
            'name_en' => ['required', 'string', 'max:255'],
            'description_az' => ['required', 'string'],
            'description_ru' => ['required', 'string'],
            'description_en' => ['required', 'string'],
            'icon' => ['required', 'string', 'max:100'],
            'xp_reward' => ['required', 'integer', 'min:0'],
            'condition_type' => ['required', 'string'],
            'condition_value' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $achievement = Achievement::create($validated);

        return response()->json(['status' => 'success', 'data' => $achievement], 201);
    }

    public function update(Request $request, Achievement $achievement): JsonResponse
    {
        $validated = $request->validate([
            'name_az' => ['sometimes', 'string', 'max:255'],
            'name_ru' => ['sometimes', 'string', 'max:255'],
            'name_en' => ['sometimes', 'string', 'max:255'],
            'description_az' => ['sometimes', 'string'],
            'description_ru' => ['sometimes', 'string'],
            'description_en' => ['sometimes', 'string'],
            'icon' => ['sometimes', 'string', 'max:100'],
            'xp_reward' => ['sometimes', 'integer', 'min:0'],
            'condition_type' => ['sometimes', 'string'],
            'condition_value' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $achievement->update($validated);

        return response()->json(['status' => 'success', 'data' => $achievement]);
    }

    public function destroy(Achievement $achievement): JsonResponse
    {
        $achievement->delete();

        return response()->json(['status' => 'success', 'message' => 'Achievement deleted.']);
    }

    public function myAchievements(Request $request): JsonResponse
    {
        $locale = $request->header('Accept-Language', 'az');
        $user = $request->user();

        $earned = $user->achievements()
            ->orderByPivot('earned_at', 'desc')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->{"name_{$locale}"} ?? $a->name_az,
                'description' => $a->{"description_{$locale}"} ?? $a->description_az,
                'icon' => $a->icon,
                'xp_reward' => $a->xp_reward,
                'earned_at' => $a->pivot->earned_at,
            ]);

        return response()->json(['status' => 'success', 'data' => $earned]);
    }
}
