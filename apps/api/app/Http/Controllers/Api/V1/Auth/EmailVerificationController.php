<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['status' => 'success', 'message' => 'Email already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['status' => 'success', 'message' => 'Verification link sent.']);
    }

    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['status' => 'error', 'message' => 'Invalid verification link.'], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['status' => 'success', 'message' => 'Email already verified.']);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json(['status' => 'success', 'message' => 'Email verified successfully.']);
    }

    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['is_verified' => $request->user()->hasVerifiedEmail()],
        ]);
    }
}
