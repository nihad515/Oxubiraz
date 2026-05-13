<?php

namespace App\Services;

use App\Mail\WelcomeMail;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\Locale;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthService
{
    public function login(string $login, string $password, string $deviceName, bool $remember = false): array
    {
        $user = User::query()
            ->where('username', $login)
            ->orWhere('email', $login)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => [__('auth.failed')],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'login' => [__('auth.inactive')],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $expiration = $remember
            ? now()->addDays(30)
            : now()->addMinutes(config('sanctum.expiration', 1440));

        $token = $user->createToken(
            $deviceName,
            ['*'],
            $expiration,
        );

        return [
            'user' => $user->load('roles.permissions'),
            'token' => $token->plainTextToken,
            'expires_at' => $expiration->toIso8601String(),
        ];
    }

    public function register(array $data): array
    {
        $parentId = null;
        if (!empty($data['parent_username'])) {
            $parent = User::where('username', $data['parent_username'])->first();
            $parentId = $parent?->id;
        }

        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'username' => $data['username'],
            'email' => $data['email'] ?? null,
            'password' => $data['password'],
            'locale' => $data['locale'],
            'school_id' => $data['school_id'] ?? null,
            'class_id' => $data['class_id'] ?? null,
            'teacher_id' => $data['teacher_id'] ?? null,
            'parent_id' => $parentId,
            'phone' => $data['phone'] ?? null,
            'is_active' => true,
            'xp' => 0,
            'level' => 0,
            'streak_days' => 0,
            'metadata' => [
                'subject' => $data['subject'] ?? null,
                'experience' => $data['experience'] ?? null,
            ],
        ]);

        $user->assignRole($data['role']);

        if ($user->email) {
            Mail::to($user->email)->queue(new WelcomeMail($user));
        }

        $expiration = now()->addMinutes(config('sanctum.expiration', 1440));
        $token = $user->createToken('web', ['*'], $expiration);

        return [
            'user' => $user->load('roles.permissions'),
            'token' => $token->plainTextToken,
            'expires_at' => $expiration->toIso8601String(),
        ];
    }
}
