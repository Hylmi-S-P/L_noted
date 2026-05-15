<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $email = strtolower((string) $request->input('email'));
            $key = $email !== '' ? $email.'|'.$request->ip() : $request->ip();

            return [
                Limit::perMinute(5)->by($key),
            ];
        });

        RateLimiter::for('ocr', function (Request $request) {
            $userKey = $request->user()?->id ? 'user:'.$request->user()->id : 'ip:'.$request->ip();
            return [
                Limit::perMinute(20)->by($userKey),
            ];
        });
    }
}
