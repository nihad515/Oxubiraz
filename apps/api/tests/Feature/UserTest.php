<?php

use App\Models\User;
use App\Models\School;
use App\Models\SchoolClass;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->student = User::factory()->create();
    $this->student->assignRole('student');
});

test('admin can list users', function () {
    $response = $this->actingAs($this->admin)->getJson('/api/v1/users');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

test('student cannot list users', function () {
    $this->actingAs($this->student)->getJson('/api/v1/users')
        ->assertForbidden();
});

test('admin can view a user', function () {
    $response = $this->actingAs($this->admin)->getJson("/api/v1/users/{$this->student->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $this->student->id)
        ->assertJsonPath('data.username', $this->student->username);
});

test('admin can update a user', function () {
    $response = $this->actingAs($this->admin)->patchJson("/api/v1/users/{$this->student->id}", [
        'first_name' => 'Updated',
        'locale' => 'en',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.first_name', 'Updated');

    expect($this->student->fresh()->locale)->toBe('en');
});

test('admin can toggle user active status', function () {
    expect($this->student->is_active)->toBeTrue();

    $this->actingAs($this->admin)
        ->patchJson("/api/v1/users/{$this->student->id}/toggle-active")
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    expect($this->student->fresh()->is_active)->toBeFalse();
});

test('admin can assign role to user', function () {
    $response = $this->actingAs($this->admin)->postJson("/api/v1/users/{$this->student->id}/assign-role", [
        'role' => 'teacher',
    ]);

    $response->assertOk();
    expect($this->student->fresh()->hasRole('teacher'))->toBeTrue();
});

test('admin can soft delete user', function () {
    $this->actingAs($this->admin)
        ->deleteJson("/api/v1/users/{$this->student->id}")
        ->assertOk();

    expect(User::find($this->student->id))->toBeNull();
    expect(User::withTrashed()->find($this->student->id))->not->toBeNull();
});

test('admin cannot delete super admin', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $this->actingAs($this->admin)
        ->deleteJson("/api/v1/users/{$superAdmin->id}")
        ->assertForbidden();
});

test('admin can restore a deleted user', function () {
    $this->student->delete();

    $this->actingAs($this->admin)
        ->postJson("/api/v1/users/{$this->student->id}/restore")
        ->assertOk();

    expect(User::find($this->student->id))->not->toBeNull();
});

test('admin can export users as csv', function () {
    $response = $this->actingAs($this->admin)->get('/api/v1/users/export');

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('user can update their own profile', function () {
    $response = $this->actingAs($this->student)->patchJson('/api/v1/users/me', [
        'first_name' => 'NewName',
        'locale' => 'ru',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.first_name', 'NewName');
});

test('user can update their own password', function () {
    $this->student->update(['password' => bcrypt('OldPass@123')]);

    $response = $this->actingAs($this->student)->putJson('/api/v1/users/me/password', [
        'current_password' => 'OldPass@123',
        'password' => 'NewPass@456',
        'password_confirmation' => 'NewPass@456',
    ]);

    $response->assertOk();
});

test('user cannot change password with wrong current password', function () {
    $this->student->update(['password' => bcrypt('CorrectPass@123')]);

    $this->actingAs($this->student)->putJson('/api/v1/users/me/password', [
        'current_password' => 'WrongPass',
        'password' => 'NewPass@456',
        'password_confirmation' => 'NewPass@456',
    ])->assertStatus(422);
});

test('user can list their active sessions', function () {
    $this->actingAs($this->student)->getJson('/api/v1/users/me/sessions')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('users list can be filtered by role', function () {
    $teacher = User::factory()->create();
    $teacher->assignRole('teacher');

    $response = $this->actingAs($this->admin)->getJson('/api/v1/users?filter[role]=teacher');

    $response->assertOk();
    collect($response->json('data'))->each(fn ($u) =>
        expect($u['roles'][0]['name'] ?? '')->toBe('teacher')
    );
});
