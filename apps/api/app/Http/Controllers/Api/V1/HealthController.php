<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [];
        $allOk = true;

        // Database check
        try {
            DB::select('SELECT 1');
            $checks['database'] = 'ok';
        } catch (\Throwable) {
            $checks['database'] = 'error';
            $allOk = false;
        }

        // Redis / cache check
        try {
            Cache::store('redis')->put('_health', 1, 5);
            $checks['redis'] = 'ok';
        } catch (\Throwable) {
            $checks['redis'] = 'error';
            $allOk = false;
        }

        return response()->json([
            'status'    => $allOk ? 'ok' : 'error',
            'version'   => config('app.version', '1.0.0'),
            'timestamp' => now()->toIso8601String(),
            'checks'    => $checks,
        ], $allOk ? 200 : 503);
    }
}
