<?php

use App\Models\User;
use App\Models\Competition;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->student = User::factory()->create();
    $this->student->assignRole('student');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->activeComp = Competition::factory()->create([
        'status' => 'active',
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addDay(),
    ]);

    $this->upcomingComp = Competition::factory()->create([
        'status' => 'upcoming',
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDays(3),
    ]);
});

test('student can list competitions', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/competitions');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('competition list includes active and upcoming', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/competitions');
    $ids = collect($response->json('data'))->pluck('id');

    expect($ids)->toContain($this->activeComp->id);
    expect($ids)->toContain($this->upcomingComp->id);
});

test('student can view active competitions', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/competitions/active');
    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($this->activeComp->id);
    expect($ids)->not->toContain($this->upcomingComp->id);
});

test('student can join an active competition', function () {
    $response = $this->actingAs($this->student)
        ->postJson("/api/v1/competitions/{$this->activeComp->id}/join");

    $response->assertOk();
    expect($this->activeComp->participants()->where('user_id', $this->student->id)->exists())->toBeTrue();
});

test('student cannot join same competition twice', function () {
    $this->actingAs($this->student)
        ->postJson("/api/v1/competitions/{$this->activeComp->id}/join");

    $this->actingAs($this->student)
        ->postJson("/api/v1/competitions/{$this->activeComp->id}/join")
        ->assertStatus(422);
});

test('student can view competition leaderboard', function () {
    $response = $this->actingAs($this->student)
        ->getJson("/api/v1/competitions/{$this->activeComp->id}/leaderboard");

    $response->assertOk()->assertJsonStructure(['data']);
});

test('admin can create a competition', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/v1/competitions', [
        'title' => 'Test Competition',
        'mode' => 'random_words',
        'language' => 'az',
        'starts_at' => now()->addDay()->toIso8601String(),
        'ends_at' => now()->addDays(3)->toIso8601String(),
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Test Competition');
});

test('student cannot create a competition', function () {
    $this->actingAs($this->student)->postJson('/api/v1/competitions', [
        'title' => 'Unauthorized',
        'mode' => 'random_words',
        'language' => 'az',
        'starts_at' => now()->addDay()->toIso8601String(),
        'ends_at' => now()->addDays(3)->toIso8601String(),
    ])->assertForbidden();
});

test('admin can delete a competition', function () {
    $this->actingAs($this->admin)
        ->deleteJson("/api/v1/competitions/{$this->activeComp->id}")
        ->assertOk();

    expect(Competition::find($this->activeComp->id))->toBeNull();
});

test('competition with max participants cannot be over-joined', function () {
    $limited = Competition::factory()->create([
        'status' => 'active',
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addDay(),
        'max_participants' => 1,
    ]);

    $other = User::factory()->create();
    $other->assignRole('student');
    $limited->participants()->attach($other->id);

    $this->actingAs($this->student)
        ->postJson("/api/v1/competitions/{$limited->id}/join")
        ->assertStatus(422);
});
