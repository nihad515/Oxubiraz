<?php

namespace App\Providers;

use App\Events\NotificationCreated;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Laravel\Horizon\Horizon;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('auth', fn (Request $r) =>
            Limit::perMinute(10)->by($r->ip())
        );

        RateLimiter::for('game', fn (Request $r) =>
            Limit::perMinute(120)->by($r->user()?->id ?: $r->ip())
        );

        // Horizon dashboard access: open in local, HTTP Basic Auth in production
        Horizon::auth(function (Request $request) {
            if (app()->environment('local')) {
                return true;
            }

            $username = env('HORIZON_USERNAME', '');
            $password = env('HORIZON_PASSWORD', '');

            if (empty($username) || empty($password)) {
                return false;
            }

            return $request->getUser() === $username
                && $request->getPassword() === $password;
        });

        // Broadcast every new DB notification to the user's private channel
        DatabaseNotification::created(function (DatabaseNotification $notification) {
            broadcast(new NotificationCreated(
                userId: (int) $notification->notifiable_id,
                notificationId: $notification->id,
                type: $notification->data['type'] ?? class_basename($notification->type),
                data: $notification->data,
            ));
        });
    }
}
