<?php

use App\Models\Achievement;
use App\Models\User;
use App\Enums\AchievementConditionType;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->student = User::factory()->create();
    $this->student->assignRole('student');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->achievements = Achievement::factory()->count(3)->create(['is_active' => true]);
    $this->inactive = Achievement::factory()->inactive()->create();
});

// ─── Student: index ──────────────────────────────────────────────────────────

test('student can list active achievements', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($this->achievements->first()->id);
    expect($ids)->not->toContain($this->inactive->id);
});

test('achievement list includes earned status field', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements');

    $response->assertOk();
    $first = $response->json('data.0');
    expect($first)->toHaveKeys(['id', 'name', 'description', 'icon', 'xp_reward', 'is_earned']);
    expect($first['is_earned'])->toBeBool();
});

test('earned achievement shows is_earned true', function () {
    $achievement = $this->achievements->first();
    $this->student->achievements()->attach($achievement->id, ['earned_at' => now()]);

    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements');

    $earned = collect($response->json('data'))->firstWhere('id', $achievement->id);
    expect($earned['is_earned'])->toBeTrue();
    expect($earned['earned_at'])->not->toBeNull();
});

test('unearned achievement shows is_earned false', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements');

    $achievement = collect($response->json('data'))->firstWhere('id', $this->achievements->first()->id);
    expect($achievement['is_earned'])->toBeFalse();
    expect($achievement['earned_at'])->toBeNull();
});

test('unauthenticated user cannot list achievements', function () {
    $this->getJson('/api/v1/achievements')->assertUnauthorized();
});

// ─── Student: my achievements ────────────────────────────────────────────────

test('student can view their earned achievements', function () {
    $a1 = $this->achievements->get(0);
    $a2 = $this->achievements->get(1);
    $this->student->achievements()->attach($a1->id, ['earned_at' => now()]);
    $this->student->achievements()->attach($a2->id, ['earned_at' => now()->subDay()]);

    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements/me');

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($a1->id)
        ->and($ids)->toContain($a2->id);
});

test('my achievements returns empty array when none earned', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements/me');

    $response->assertOk();
    expect($response->json('data'))->toBeEmpty();
});

test('my achievements have earned_at field', function () {
    $this->student->achievements()->attach(
        $this->achievements->first()->id,
        ['earned_at' => now()]
    );

    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements/me');

    $item = $response->json('data.0');
    expect($item)->toHaveKey('earned_at');
    expect($item['earned_at'])->not->toBeNull();
});

test('unauthenticated user cannot view my achievements', function () {
    $this->getJson('/api/v1/achievements/me')->assertUnauthorized();
});

// ─── Admin: adminIndex ────────────────────────────────────────────────────────

test('admin can list all achievements including inactive', function () {
    $response = $this->actingAs($this->admin)->getJson('/api/v1/achievements/admin');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($this->inactive->id);
});

test('admin index returns multilingual fields', function () {
    $response = $this->actingAs($this->admin)->getJson('/api/v1/achievements/admin');

    $first = $response->json('data.0');
    expect($first)->toHaveKeys(['name_az', 'name_ru', 'name_en', 'description_az', 'description_ru', 'description_en']);
});

test('student cannot access admin achievements list', function () {
    $this->actingAs($this->student)
        ->getJson('/api/v1/achievements/admin')
        ->assertForbidden();
});

// ─── Admin: store ─────────────────────────────────────────────────────────────

test('admin can create an achievement', function () {
    $payload = [
        'name_az'         => 'Sürətli oxucu',
        'name_ru'         => 'Быстрый читатель',
        'name_en'         => 'Fast Reader',
        'description_az'  => '100 WPM-ə çatın',
        'description_ru'  => 'Достигните 100 WPM',
        'description_en'  => 'Reach 100 WPM',
        'icon'            => '🚀',
        'xp_reward'       => 100,
        'condition_type'  => AchievementConditionType::WpmReached->value,
        'condition_value' => 100,
    ];

    $response = $this->actingAs($this->admin)->postJson('/api/v1/achievements', $payload);

    $response->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.name_en', 'Fast Reader')
        ->assertJsonPath('data.xp_reward', 100);

    $this->assertDatabaseHas('achievements', ['name_en' => 'Fast Reader', 'xp_reward' => 100]);
});

test('achievement creation requires all multilingual fields', function () {
    $this->actingAs($this->admin)->postJson('/api/v1/achievements', [
        'name_az'        => 'Only AZ',
        'icon'           => '⭐',
        'xp_reward'      => 50,
        'condition_type' => AchievementConditionType::FirstSession->value,
        'condition_value' => 1,
    ])->assertUnprocessable();
});

test('achievement creation validates condition_value is positive', function () {
    $this->actingAs($this->admin)->postJson('/api/v1/achievements', [
        'name_az'         => 'Test AZ',
        'name_ru'         => 'Test RU',
        'name_en'         => 'Test EN',
        'description_az'  => 'Desc AZ',
        'description_ru'  => 'Desc RU',
        'description_en'  => 'Desc EN',
        'icon'            => '⭐',
        'xp_reward'       => 50,
        'condition_type'  => AchievementConditionType::WpmReached->value,
        'condition_value' => 0, // must be min:1
    ])->assertUnprocessable();
});

test('student cannot create achievement', function () {
    $this->actingAs($this->student)->postJson('/api/v1/achievements', [
        'name_az'         => 'Test',
        'name_ru'         => 'Test',
        'name_en'         => 'Test',
        'description_az'  => 'Test',
        'description_ru'  => 'Test',
        'description_en'  => 'Test',
        'icon'            => '🏆',
        'xp_reward'       => 10,
        'condition_type'  => AchievementConditionType::FirstSession->value,
        'condition_value' => 1,
    ])->assertForbidden();
});

// ─── Admin: update ────────────────────────────────────────────────────────────

test('admin can update an achievement', function () {
    $achievement = $this->achievements->first();

    $response = $this->actingAs($this->admin)->patchJson(
        "/api/v1/achievements/{$achievement->id}",
        ['xp_reward' => 999, 'is_active' => false]
    );

    $response->assertOk()
        ->assertJsonPath('data.xp_reward', 999)
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('achievements', ['id' => $achievement->id, 'xp_reward' => 999, 'is_active' => false]);
});

test('student cannot update achievement', function () {
    $achievement = $this->achievements->first();

    $this->actingAs($this->student)
        ->patchJson("/api/v1/achievements/{$achievement->id}", ['xp_reward' => 1])
        ->assertForbidden();
});

test('updating non-existent achievement returns 404', function () {
    $this->actingAs($this->admin)
        ->patchJson('/api/v1/achievements/99999', ['xp_reward' => 10])
        ->assertNotFound();
});

// ─── Admin: destroy ───────────────────────────────────────────────────────────

test('admin can delete an achievement', function () {
    $achievement = $this->achievements->last();

    $this->actingAs($this->admin)
        ->deleteJson("/api/v1/achievements/{$achievement->id}")
        ->assertOk()
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseMissing('achievements', ['id' => $achievement->id]);
});

test('student cannot delete achievement', function () {
    $achievement = $this->achievements->first();

    $this->actingAs($this->student)
        ->deleteJson("/api/v1/achievements/{$achievement->id}")
        ->assertForbidden();

    $this->assertDatabaseHas('achievements', ['id' => $achievement->id]);
});

test('deleting non-existent achievement returns 404', function () {
    $this->actingAs($this->admin)
        ->deleteJson('/api/v1/achievements/99999')
        ->assertNotFound();
});

// ─── Localization ─────────────────────────────────────────────────────────────

test('achievement index respects Accept-Language header', function () {
    $achievement = $this->achievements->first();

    $responsEn = $this->actingAs($this->student)
        ->withHeaders(['Accept-Language' => 'en'])
        ->getJson('/api/v1/achievements');

    $item = collect($responsEn->json('data'))->firstWhere('id', $achievement->id);
    expect($item['name'])->toBe($achievement->name_en);
});

test('achievement index falls back to az when locale header missing', function () {
    $achievement = $this->achievements->first();

    $response = $this->actingAs($this->student)->getJson('/api/v1/achievements');

    $item = collect($response->json('data'))->firstWhere('id', $achievement->id);
    expect($item['name'])->toBe($achievement->name_az);
});
