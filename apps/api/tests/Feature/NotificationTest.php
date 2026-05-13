<?php

use App\Models\User;
use App\Notifications\LevelUp;
use App\Notifications\StreakMilestone;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->student = User::factory()->create();
    $this->student->assignRole('student');
});

test('user can list notifications', function () {
    $this->student->notify(new LevelUp(2, 150));
    $this->student->notify(new StreakMilestone(7, 50));

    $response = $this->actingAs($this->student)->getJson('/api/v1/notifications');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data',
            'meta' => ['total'],
        ]);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('user can get unread notification count', function () {
    $this->student->notify(new LevelUp(2, 150));

    $response = $this->actingAs($this->student)->getJson('/api/v1/notifications/unread-count');

    $response->assertOk()
        ->assertJsonStructure(['data' => ['count']]);

    expect($response->json('data.count'))->toBeGreaterThanOrEqual(1);
});

test('user can mark a notification as read', function () {
    $this->student->notify(new LevelUp(3, 300));
    $notification = $this->student->notifications()->first();

    expect($notification->read_at)->toBeNull();

    $this->actingAs($this->student)
        ->postJson("/api/v1/notifications/{$notification->id}/read")
        ->assertOk();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('user can mark all notifications as read', function () {
    $this->student->notify(new LevelUp(2, 150));
    $this->student->notify(new StreakMilestone(7, 50));
    $this->student->notify(new StreakMilestone(14, 100));

    $this->actingAs($this->student)
        ->postJson('/api/v1/notifications/read-all')
        ->assertOk();

    expect($this->student->unreadNotifications()->count())->toBe(0);
});

test('user can delete a single notification', function () {
    $this->student->notify(new LevelUp(2, 150));
    $notification = $this->student->notifications()->first();

    $this->actingAs($this->student)
        ->deleteJson("/api/v1/notifications/{$notification->id}")
        ->assertOk();

    expect($this->student->notifications()->find($notification->id))->toBeNull();
});

test('user can delete all notifications', function () {
    $this->student->notify(new LevelUp(2, 150));
    $this->student->notify(new StreakMilestone(7, 50));

    $this->actingAs($this->student)
        ->deleteJson('/api/v1/notifications')
        ->assertOk();

    expect($this->student->notifications()->count())->toBe(0);
});

test('user cannot read another users notification', function () {
    $otherUser = User::factory()->create();
    $otherUser->assignRole('student');
    $otherUser->notify(new LevelUp(2, 150));
    $notification = $otherUser->notifications()->first();

    // Should return 404 because query is scoped to auth user
    $this->actingAs($this->student)
        ->postJson("/api/v1/notifications/{$notification->id}/read")
        ->assertNotFound();
});

test('unread count is zero when no notifications', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/notifications/unread-count');
    $response->assertOk();
    expect($response->json('data.count'))->toBe(0);
});
