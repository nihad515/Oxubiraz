<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
    $this->superAdmin = User::where('username', 'superadmin')->first();
    $this->student = User::factory()->create()->assignRole('student');
});

test('super admin can access role management', function () {
    $this->actingAs($this->superAdmin)
        ->getJson('/api/v1/roles')
        ->assertOk();
});

test('student cannot access role management', function () {
    $this->actingAs($this->student)
        ->getJson('/api/v1/roles')
        ->assertForbidden();
});

test('super admin can create a role', function () {
    $response = $this->actingAs($this->superAdmin)->postJson('/api/v1/roles', [
        'name' => 'custom_role',
        'display_name' => 'Custom Role',
        'permissions' => ['view_texts', 'play_game'],
    ]);

    $response->assertCreated();
    expect(Role::where('name', 'custom_role')->exists())->toBeTrue();
});

test('super admin can assign permissions to role', function () {
    $role = Role::create(['name' => 'test_role', 'guard_name' => 'web']);

    $this->actingAs($this->superAdmin)->putJson("/api/v1/roles/{$role->id}/permissions", [
        'permissions' => ['play_game', 'view_texts'],
    ])->assertOk();

    expect($role->fresh()->hasPermissionTo('play_game'))->toBeTrue();
});

test('strings endpoint is public', function () {
    $this->getJson('/api/v1/strings/locale/az')->assertOk();
    $this->getJson('/api/v1/strings/locale/ru')->assertOk();
    $this->getJson('/api/v1/strings/locale/en')->assertOk();
});

test('student cannot manage strings', function () {
    $this->actingAs($this->student)
        ->postJson('/api/v1/strings', [
            'string_key' => 'test.key',
            'group_name' => 'common',
            'az' => 'Test',
            'ru' => 'Test',
            'en' => 'Test',
        ])->assertForbidden();
});
