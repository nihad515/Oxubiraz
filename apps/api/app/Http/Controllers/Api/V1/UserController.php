<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\UsersExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = QueryBuilder::for(User::class)
            ->allowedFilters([
                AllowedFilter::exact('role', null, false),
                AllowedFilter::exact('school_id'),
                AllowedFilter::exact('class_id'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::exact('locale'),
                AllowedFilter::scope('search', 'search'),
            ])
            ->allowedSorts(['created_at', 'first_name', 'last_name', 'xp', 'level'])
            ->with(['roles', 'school', 'schoolClass'])
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['roles.permissions', 'school', 'schoolClass', 'achievements']);

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user),
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'locale' => ['sometimes', 'in:az,ru,en'],
            'school_id' => ['sometimes', 'nullable', 'exists:schools,id'],
            'class_id' => ['sometimes', 'nullable', 'exists:school_classes,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user->fresh(['roles', 'school'])),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Prevent deleting super admin
        if ($user->isSuperAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Cannot delete super admin.'], 403);
        }

        $user->delete();

        return response()->json(['status' => 'success', 'message' => 'User deleted.']);
    }

    public function restore(int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['status' => 'success', 'data' => new UserResource($user)]);
    }

    public function updatePassword(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['status' => 'success', 'message' => 'Password updated.']);
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user->fresh(['roles'])),
        ]);
    }

    public function toggleActive(User $user): JsonResponse
    {
        if ($user->isSuperAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Cannot deactivate super admin.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'status' => 'success',
            'data' => ['is_active' => $user->is_active],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles.permissions', 'school', 'schoolClass']);

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user),
        ]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'locale' => ['sometimes', 'in:az,ru,en'],
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user->fresh(['roles'])),
        ]);
    }

    public function updateMyPassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $request->user()->update(['password' => Hash::make($request->password)]);

        return response()->json(['status' => 'success', 'message' => 'Password updated.']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:5120', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $user = $request->user();
        $user->clearMediaCollection('avatar');
        $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');

        return response()->json([
            'status' => 'success',
            'data' => [
                'avatar_url' => $user->getFirstMediaUrl('avatar', 'medium'),
                'avatar_thumb' => $user->getFirstMediaUrl('avatar', 'thumb'),
            ],
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()
            ->latest()
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'created_at' => $token->created_at->toIso8601String(),
                'is_current' => $token->id === $request->user()->currentAccessToken()->id,
            ]);

        return response()->json(['status' => 'success', 'data' => $tokens]);
    }

    public function revokeSession(Request $request, int $tokenId): JsonResponse
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();

        return response()->json(['status' => 'success', 'message' => 'Session revoked.']);
    }

    public function revokeAllSessions(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;
        $request->user()->tokens()->where('id', '!=', $currentId)->delete();

        return response()->json(['status' => 'success', 'message' => 'All other sessions revoked.']);
    }

    public function export(Request $request): mixed
    {
        $users = QueryBuilder::for(User::class)
            ->allowedFilters([
                AllowedFilter::exact('role', null, false),
                AllowedFilter::exact('school_id'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::scope('search', 'search'),
            ])
            ->with(['roles', 'school'])
            ->get();

        $format = $request->input('format', 'xlsx');
        $filename = 'users_' . now()->format('Ymd_His') . '.' . $format;
        $writerType = $format === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(new UsersExport($users), $filename, $writerType);
    }
}
