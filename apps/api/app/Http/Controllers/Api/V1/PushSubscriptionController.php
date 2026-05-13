<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint'         => ['required', 'string', 'url', 'max:500'],
            'public_key'       => ['required', 'string', 'max:255'],
            'auth_token'       => ['required', 'string', 'max:255'],
            'content_encoding' => ['sometimes', 'string', 'in:aesgcm,aes128gcm'],
        ]);

        $user = $request->user();

        $user->updatePushSubscription(
            $validated['endpoint'],
            $validated['public_key'],
            $validated['auth_token'],
            $validated['content_encoding'] ?? 'aesgcm',
        );

        return response()->json(['status' => 'success', 'message' => 'Subscribed to push notifications.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:500'],
        ]);

        $request->user()->deletePushSubscription($validated['endpoint']);

        return response()->json(['status' => 'success', 'message' => 'Unsubscribed from push notifications.']);
    }

    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['public_key' => config('webpush.vapid.public_key', '')],
        ]);
    }
}
