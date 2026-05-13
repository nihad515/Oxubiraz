<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    private const CACHE_KEY = 'app_settings';
    private const DEFAULTS = [
        'max_file_size_mb' => 10,
        'allowed_game_modes' => ['random_words', 'text_reading', 'sentence_reading', 'memory', 'ai'],
        'maintenance_mode' => false,
        'registration_open' => true,
        'default_locale' => 'az',
        'bcrypt_rounds' => 12,
        'sanctum_token_expiration' => 1440,
        'sanctum_token_expiration_remember' => 43200,
    ];

    public function index(): JsonResponse
    {
        $settings = Cache::remember(self::CACHE_KEY, 3600, fn () => self::DEFAULTS);

        return response()->json(['status' => 'success', 'data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'max_file_size_mb' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'allowed_game_modes' => ['sometimes', 'array'],
            'allowed_game_modes.*' => ['in:random_words,text_reading,sentence_reading,memory,ai'],
            'maintenance_mode' => ['sometimes', 'boolean'],
            'registration_open' => ['sometimes', 'boolean'],
            'default_locale' => ['sometimes', 'in:az,ru,en'],
        ]);

        $current = Cache::get(self::CACHE_KEY, self::DEFAULTS);
        $updated = array_merge($current, $validated);
        Cache::put(self::CACHE_KEY, $updated, 3600);

        return response()->json(['status' => 'success', 'data' => $updated]);
    }

    public function public(): JsonResponse
    {
        $settings = Cache::get(self::CACHE_KEY, self::DEFAULTS);

        return response()->json([
            'status' => 'success',
            'data' => [
                'maintenance_mode' => $settings['maintenance_mode'],
                'registration_open' => $settings['registration_open'],
                'default_locale' => $settings['default_locale'],
                'allowed_game_modes' => $settings['allowed_game_modes'],
            ],
        ]);
    }
}
