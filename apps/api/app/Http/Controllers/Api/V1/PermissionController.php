<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::all()->groupBy(fn ($p) => explode('.', $p->name)[0]);

        $grouped = $permissions->map(fn ($group, $key) => [
            'group' => $key,
            'permissions' => $group->pluck('name'),
        ])->values();

        return response()->json(['status' => 'success', 'data' => $grouped]);
    }
}
