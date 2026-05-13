<?php

use App\Models\User;
use App\Models\GameSession;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->parent = User::factory()->create();
    $this->parent->assignRole('parent');

    $this->child = User::factory()->withXp(200)->create([
        'parent_id' => $this->parent->id,
    ]);
    $this->child->assignRole('student');

    $this->otherChild = User::factory()->create(['parent_id' => null]);
    $this->otherChild->assignRole('student');

    GameSession::factory()->count(3)->create([
        'user_id' => $this->child->id,
        'wpm' => 70,
        'language' => 'az',
        'mode' => 'random_words',
    ]);
});

test('parent can list their children', function () {
    $response = $this->actingAs($this->parent)->getJson('/api/v1/parent/children');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($this->child->id);
    expect($ids)->not->toContain($this->otherChild->id);
});

test('parent can view child stats', function () {
    $response = $this->actingAs($this->parent)->getJson("/api/v1/parent/children/{$this->child->id}");

    $response->assertOk()
        ->assertJsonStructure([
            'data' => ['id', 'name', 'level', 'xp', 'total_sessions'],
        ]);
});

test('parent cannot view stats of another parents child', function () {
    $this->actingAs($this->parent)
        ->getJson("/api/v1/parent/children/{$this->otherChild->id}")
        ->assertForbidden();
});

test('student cannot access parent endpoints', function () {
    $this->actingAs($this->child)->getJson('/api/v1/parent/children')
        ->assertForbidden();
});

test('parent with no children returns empty list', function () {
    $emptyParent = User::factory()->create();
    $emptyParent->assignRole('parent');

    $response = $this->actingAs($emptyParent)->getJson('/api/v1/parent/children');

    $response->assertOk();
    expect($response->json('data'))->toBeEmpty();
});

test('child stats include wpm trend', function () {
    $response = $this->actingAs($this->parent)->getJson("/api/v1/parent/children/{$this->child->id}");

    $response->assertOk();
    expect($response->json('data'))->toHaveKey('wpm_trend');
});

test('child stats include language breakdown', function () {
    $response = $this->actingAs($this->parent)->getJson("/api/v1/parent/children/{$this->child->id}");

    $response->assertOk();
    expect($response->json('data'))->toHaveKey('by_language');
});
