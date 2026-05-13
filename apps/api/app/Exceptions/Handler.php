<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    private function handleApiException(Throwable $e, Request $request): mixed
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($e instanceof UnauthorizedException) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
                'code' => 'INSUFFICIENT_PERMISSIONS',
            ], 403);
        }

        if ($e instanceof ModelNotFoundException) {
            $model = class_basename($e->getModel());
            return response()->json([
                'status' => 'error',
                'message' => "{$model} not found",
                'code' => 'NOT_FOUND',
            ], 404);
        }

        if ($e instanceof HttpException) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage() ?: 'HTTP Error',
            ], $e->getStatusCode());
        }

        // Generic server error — don't expose internals in production
        $message = config('app.debug')
            ? $e->getMessage()
            : 'An unexpected error occurred.';

        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], 500);
    }
}
