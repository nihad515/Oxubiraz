<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

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
    }
}
