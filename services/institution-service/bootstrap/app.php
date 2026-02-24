<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.service' => \App\Http\Middleware\VerifyServiceToken::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        // UC10: Fermer automatiquement les inscriptions (System Cron)
        $schedule->command('registrations:close-expired')->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
