<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain
    |--------------------------------------------------------------------------
    */
    'domain' => env('HORIZON_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Path
    |--------------------------------------------------------------------------
    */
    'path' => env('HORIZON_PATH', 'horizon'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    */
    'use' => 'default',

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Prefix
    |--------------------------------------------------------------------------
    */
    'prefix' => env('HORIZON_PREFIX', Str::slug(env('APP_NAME', 'oxubiraz'), '_') . '_horizon:'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Route Middleware
    |--------------------------------------------------------------------------
    */
    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Queue Wait Time Thresholds (seconds)
    |--------------------------------------------------------------------------
    */
    'waits' => [
        'redis:high'          => 30,
        'redis:notifications' => 60,
        'redis:default'       => 90,
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Trimming Times (minutes)
    |--------------------------------------------------------------------------
    */
    'trim' => [
        'recent'        => 60,
        'pending'       => 60,
        'completed'     => 60,
        'recent_failed' => 10080,  // 7 days
        'failed'        => 10080,
        'monitored'     => 10080,
    ],

    /*
    |--------------------------------------------------------------------------
    | Silenced Jobs
    |--------------------------------------------------------------------------
    */
    'silenced' => [],

    /*
    |--------------------------------------------------------------------------
    | Metrics Snapshot Retention
    |--------------------------------------------------------------------------
    */
    'metrics' => [
        'trim_snapshots' => [
            'job'   => 24,
            'queue' => 24,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Fast Termination
    |--------------------------------------------------------------------------
    */
    'fast_termination' => false,

    /*
    |--------------------------------------------------------------------------
    | Memory Limit (MB) — Horizon master process
    |--------------------------------------------------------------------------
    */
    'memory_limit' => 64,

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Configuration
    |--------------------------------------------------------------------------
    |
    | Queues (priority order):
    |   high          — critical real-time work (e.g. streak calculations)
    |   notifications — email / push / DB notifications
    |   default       — general async jobs
    |
    */
    'defaults' => [
        'supervisor-default' => [
            'connection'  => 'redis',
            'queue'       => ['high', 'notifications', 'default'],
            'balance'     => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 10,
            'maxTime'      => 0,
            'maxJobs'      => 0,
            'memory'       => 128,
            'tries'        => 3,
            'timeout'      => 60,
            'nice'         => 0,
        ],
    ],

    'environments' => [

        'production' => [
            'supervisor-default' => [
                'connection'          => 'redis',
                'queue'               => ['high', 'notifications', 'default'],
                'balance'             => 'auto',
                'autoScalingStrategy' => 'time',
                'minProcesses'        => 2,
                'maxProcesses'        => 15,
                'balanceMaxShift'     => 1,
                'balanceCooldown'     => 3,
                'memory'              => 128,
                'tries'               => 3,
                'timeout'             => 60,
                'nice'                => 0,
            ],
        ],

        'local' => [
            'supervisor-default' => [
                'connection'   => 'redis',
                'queue'        => ['high', 'notifications', 'default'],
                'balance'      => 'simple',
                'minProcesses' => 1,
                'maxProcesses' => 4,
                'memory'       => 128,
                'tries'        => 3,
                'timeout'      => 60,
                'nice'         => 0,
            ],
        ],

    ],
];
