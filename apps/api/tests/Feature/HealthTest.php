<?php

test('health endpoint returns ok when db and cache are reachable', function () {
    $response = $this->getJson('/api/health');

    $response->assertOk()
        ->assertJsonPath('status', 'ok')
        ->assertJsonStructure([
            'status',
            'version',
            'timestamp',
            'checks' => ['database', 'redis'],
        ]);

    expect($response->json('checks.database'))->toBe('ok');
    expect($response->json('checks.redis'))->toBe('ok');
});

test('health endpoint is accessible without authentication', function () {
    $this->getJson('/api/health')->assertOk();
});
