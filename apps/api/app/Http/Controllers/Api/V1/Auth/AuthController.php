<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly AchievementService $achievementService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            login: $request->validated('login'),
            password: $request->validated('password'),
            deviceName: $request->validated('device_name', $request->userAgent() ?? 'web'),
            remember: $request->boolean('remember'),
        );

        return response()->json([
            'status' => 'success',
            'data' => [
                'access_token' => $result['token'],
                'token_type' => 'Bearer',
                'expires_at' => $result['expires_at'],
                'user' => new UserResource($result['user']),
            ],
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        // Check first-session achievement
        $this->achievementService->checkAchievements($result['user']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'access_token' => $result['token'],
                'token_type' => 'Bearer',
                'expires_at' => $result['expires_at'],
                'user' => new UserResource($result['user']),
            ],
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new UserResource($request->user()->load('roles.permissions')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
