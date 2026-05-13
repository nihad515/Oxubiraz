<?php

use App\Models\User;
use App\Models\GameSession;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->student = User::factory()->withXp(300)->create();
    $this->student->assignRole('student');

    $this->teacher = User::factory()->create();
    $this->teacher->assignRole('teacher');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    // Seed some game sessions for the student
    GameSession::factory()->count(5)->create([
        'user_id' => $this->student->id,
        'wpm' => 80,
        'language' => 'az',
        'mode' => 'random_words',
    ]);
});

test('student can get their own stats', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/analytics/me');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => ['total_sessions', 'avg_wpm', 'best_wpm'],
        ]);
});

test('teacher can view analytics overview', function () {
    $response = $this->actingAs($this->teacher)->getJson('/api/v1/analytics/overview');
    $response->assertOk()->assertJsonStructure(['data']);
});

test('admin can view analytics overview', function () {
    $response = $this->actingAs($this->admin)->getJson('/api/v1/analytics/overview');
    $response->assertOk()->assertJsonStructure(['data']);
});

test('student cannot view analytics overview', function () {
    $this->actingAs($this->student)->getJson('/api/v1/analytics/overview')
        ->assertForbidden();
});

test('teacher can view daily analytics with period filter', function () {
    foreach (['week', 'month', 'year'] as $period) {
        $this->actingAs($this->teacher)
            ->getJson("/api/v1/analytics/daily?period={$period}")
            ->assertOk();
    }
});

test('teacher can view breakdown by language', function () {
    $response = $this->actingAs($this->teacher)->getJson('/api/v1/analytics/by-language');

    $response->assertOk()->assertJsonStructure(['data']);
    $data = $response->json('data');
    if (!empty($data)) {
        expect($data[0])->toHaveKeys(['language', 'sessions']);
    }
});

test('teacher can view breakdown by mode', function () {
    $response = $this->actingAs($this->teacher)->getJson('/api/v1/analytics/by-mode');

    $response->assertOk()->assertJsonStructure(['data']);
});

test('admin can view a specific student analytics', function () {
    $response = $this->actingAs($this->admin)->getJson("/api/v1/analytics/student/{$this->student->id}");
    $response->assertOk()->assertJsonStructure(['data']);
});

test('teacher can get top students', function () {
    $response = $this->actingAs($this->teacher)->getJson('/api/v1/analytics/top-students');
    $response->assertOk()->assertJsonStructure(['data']);
});

test('admin can export analytics as csv', function () {
    $response = $this->actingAs($this->admin)->get('/api/v1/analytics/export');
    $response->assertOk();
});

test('my stats returns zero values when no sessions exist', function () {
    $newStudent = User::factory()->create();
    $newStudent->assignRole('student');

    $response = $this->actingAs($newStudent)->getJson('/api/v1/analytics/me');

    $response->assertOk();
    expect($response->json('data.total_sessions'))->toBe(0);
});
