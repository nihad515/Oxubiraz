<?php

use App\Models\User;
use App\Models\WordList;
use App\Models\Word;

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
