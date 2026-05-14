<?php

use App\Models\User;
use App\Models\WordList;
use App\Models\Word;
use App\Models\GameSession;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->student = User::factory()->create();
    $this->student->assignRole('student');

    // Create a word list
    $this->wordList = WordList::factory()->create(['language' => 'az', 'is_active' => true]);
    Word::factory()->count(100)->create(['word_list_id' => $this->wordList->id, 'language' => 'az']);
});

test('student can start a game session', function () {
    $response = $this->actingAs($this->student)->postJson('/api/v1/game/start', [
        'mode' => 'random_words',
        'duration' => 60,
        'language' => 'az',
        'word_count' => 50,
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => ['session_id', 'words', 'config'],
        ]);

    expect($response->json('data.words'))->toBeArray()->not->toBeEmpty();
});

test('student can finish a game and earn xp', function () {
    $initialXp = $this->student->xp;

    $response = $this->actingAs($this->student)->postJson('/api/v1/game/finish', [
        'mode' => 'random_words',
        'duration' => 60,
        'language' => 'az',
        'total_words' => 50,
        'clicked_words' => 40,
        'accuracy' => 80.0,
        'completion_percentage' => 80.0,
        'time_elapsed_ms' => 55000,
        'is_completed' => false,
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'data' => ['id', 'wpm', 'xp_earned'],
        ]);

    $this->student->refresh();
    expect($this->student->xp)->toBeGreaterThan($initialXp);
});

test('wpm is correctly calculated', function () {
    $response = $this->actingAs($this->student)->postJson('/api/v1/game/finish', [
        'mode' => 'random_words',
        'duration' => 60,
        'language' => 'az',
        'total_words' => 60,
        'clicked_words' => 60,
        'accuracy' => 100.0,
        'completion_percentage' => 100.0,
        'time_elapsed_ms' => 60000, // Exactly 60s = 60 words/min = 60 WPM
        'is_completed' => true,
    ]);

    $response->assertOk();
    expect($response->json('data.wpm'))->toBe(60);
});

test('unauthorized user cannot play game', function () {
    $this->postJson('/api/v1/game/start', [
        'mode' => 'random_words',
        'duration' => 60,
        'language' => 'az',
    ])->assertUnauthorized();
});

test('admin cannot play game without permission', function () {
    $admin = User::factory()->create();
    // Admin has manage_users but NOT play_game
    $admin->assignRole('admin');

    $this->actingAs($admin)->postJson('/api/v1/game/start', [
        'mode' => 'random_words',
        'duration' => 60,
        'language' => 'az',
    ])->assertForbidden();
});

test('game history is paginated', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/game/history');

    $response->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['current_page', 'total']]);
});

// ─── Results ──────────────────────────────────────────────────────────────────

test('student can get their results stats', function () {
    GameSession::factory()->forUser($this->student)->count(3)->create();

    $response = $this->actingAs($this->student)->getJson('/api/v1/game/results');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => [
                'total_sessions',
                'total_words',
                'best_wpm',
                'average_wpm',
                'sessions_today',
                'completion_rate',
            ],
        ]);

    expect($response->json('data.total_sessions'))->toBe(3);
});

test('results shows zero stats for new user', function () {
    $newStudent = User::factory()->create();
    $newStudent->assignRole('student');

    $response = $this->actingAs($newStudent)->getJson('/api/v1/game/results');

    $response->assertOk();
    expect($response->json('data.total_sessions'))->toBe(0);
    expect($response->json('data.best_wpm'))->toBe(0);
    expect($response->json('data.completion_rate'))->toBe(0.0);
});

test('completion rate reflects completed vs total sessions', function () {
    GameSession::factory()->forUser($this->student)->completed()->count(2)->create();
    GameSession::factory()->forUser($this->student)->create(['is_completed' => false, 'completion_percentage' => 50]);

    $response = $this->actingAs($this->student)->getJson('/api/v1/game/results');

    $response->assertOk();
    // 2 completed out of 3 = ~66.7%
    $rate = $response->json('data.completion_rate');
    expect($rate)->toBeGreaterThan(60.0)->toBeLessThan(70.0);
});

test('unauthenticated user cannot get results', function () {
    $this->getJson('/api/v1/game/results')->assertUnauthorized();
});

// ─── Config ───────────────────────────────────────────────────────────────────

test('student can get game config', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/game/config');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => ['modes', 'durations', 'languages', 'difficulties', 'default_word_count'],
        ]);
});

test('game config includes all expected modes', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/game/config');

    $modes = $response->json('data.modes');
    expect($modes)->toContain('random_words')
        ->and($modes)->toContain('text_reading')
        ->and($modes)->toContain('memory');
});

test('game config includes all valid durations', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/game/config');

    expect($response->json('data.durations'))->toBe([30, 60, 90]);
});

// ─── Random Words ─────────────────────────────────────────────────────────────

test('student can fetch random words', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/game/random-words?language=az');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data' => ['words']]);

    expect($response->json('data.words'))->toBeArray()->not->toBeEmpty();
});

test('random words validates language', function () {
    $this->actingAs($this->student)
        ->getJson('/api/v1/game/random-words?language=xx')
        ->assertUnprocessable();
});

// ─── Validation ───────────────────────────────────────────────────────────────

test('game start rejects invalid mode', function () {
    $this->actingAs($this->student)->postJson('/api/v1/game/start', [
        'mode'     => 'invalid_mode',
        'duration' => 60,
        'language' => 'az',
    ])->assertUnprocessable();
});

test('game start rejects invalid duration', function () {
    $this->actingAs($this->student)->postJson('/api/v1/game/start', [
        'mode'     => 'random_words',
        'duration' => 45, // not in [30, 60, 90]
        'language' => 'az',
    ])->assertUnprocessable();
});

test('game start rejects invalid language', function () {
    $this->actingAs($this->student)->postJson('/api/v1/game/start', [
        'mode'     => 'random_words',
        'duration' => 60,
        'language' => 'fr',
    ])->assertUnprocessable();
});

test('game finish rejects missing required fields', function () {
    $this->actingAs($this->student)->postJson('/api/v1/game/finish', [
        'mode' => 'random_words',
    ])->assertUnprocessable();
});

test('game finish rejects accuracy out of range', function () {
    $this->actingAs($this->student)->postJson('/api/v1/game/finish', [
        'mode'                  => 'random_words',
        'duration'              => 60,
        'language'              => 'az',
        'total_words'           => 50,
        'clicked_words'         => 50,
        'accuracy'              => 110.0, // max is 100
        'completion_percentage' => 100.0,
        'time_elapsed_ms'       => 60000,
        'is_completed'          => true,
    ])->assertUnprocessable();
});

// ─── XP accumulation ─────────────────────────────────────────────────────────

test('multiple game sessions accumulate xp', function () {
    $initialXp = $this->student->xp;

    foreach (range(1, 3) as $_) {
        $this->actingAs($this->student)->postJson('/api/v1/game/finish', [
            'mode'                  => 'random_words',
            'duration'              => 60,
            'language'              => 'az',
            'total_words'           => 50,
            'clicked_words'         => 50,
            'accuracy'              => 100.0,
            'completion_percentage' => 100.0,
            'time_elapsed_ms'       => 60000,
            'is_completed'          => true,
        ])->assertOk();
    }

    $this->student->refresh();
    expect($this->student->xp)->toBeGreaterThan($initialXp);
});
