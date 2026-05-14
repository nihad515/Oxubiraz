<?php

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->teacher = User::factory()->create();
    $this->teacher->assignRole('teacher');

    $this->student = User::factory()->create();
    $this->student->assignRole('student');

    $this->school = School::factory()->create(['name' => 'Test Məktəb']);
    $this->class = SchoolClass::factory()->create(['school_id' => $this->school->id, 'name' => '5A']);
});

test('authenticated user can list schools', function () {
    $this->actingAs($this->student)->getJson('/api/v1/schools')
        ->assertOk()
        ->assertJsonStructure(['status', 'data']);
});

test('authenticated user can view a school', function () {
    $this->actingAs($this->student)->getJson("/api/v1/schools/{$this->school->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $this->school->id)
        ->assertJsonPath('data.name', 'Test Məktəb');
});

test('authenticated user can list classes for a school', function () {
    $response = $this->actingAs($this->student)->getJson("/api/v1/schools/{$this->school->id}/classes");
    $response->assertOk();
    $classes = collect($response->json('data'));
    expect($classes->where('id', $this->class->id)->count())->toBe(1);
});

test('admin can create a school', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/v1/schools', [
        'name' => 'Yeni Məktəb',
        'city' => 'Bakı',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Yeni Məktəb');

    expect(School::where('name', 'Yeni Məktəb')->exists())->toBeTrue();
});

test('student cannot create a school', function () {
    $this->actingAs($this->student)->postJson('/api/v1/schools', [
        'name' => 'Forbidden',
    ])->assertForbidden();
});

test('admin can add a class to a school', function () {
    $response = $this->actingAs($this->admin)->postJson(
        "/api/v1/schools/{$this->school->id}/classes",
        ['name' => '6B', 'grade' => 6]
    );

    $response->assertCreated();
    expect($this->school->classes()->where('name', '6B')->exists())->toBeTrue();
});

test('admin can update a school', function () {
    $this->actingAs($this->admin)->patchJson("/api/v1/schools/{$this->school->id}", [
        'name' => 'Yenilənmiş Məktəb',
    ])->assertOk()->assertJsonPath('data.name', 'Yenilənmiş Məktəb');

    expect($this->school->fresh()->name)->toBe('Yenilənmiş Məktəb');
});

test('admin can delete a school', function () {
    $this->actingAs($this->admin)->deleteJson("/api/v1/schools/{$this->school->id}")
        ->assertOk();

    expect(School::find($this->school->id))->toBeNull();
});

test('school name is required', function () {
    $this->actingAs($this->admin)->postJson('/api/v1/schools', [])
        ->assertUnprocessable();
});

test('admin can update a class', function () {
    $this->actingAs($this->admin)->patchJson("/api/v1/classes/{$this->class->id}", [
        'name' => '5B',
    ])->assertOk()->assertJsonPath('data.name', '5B');
});

test('admin can delete a class', function () {
    $this->actingAs($this->admin)->deleteJson("/api/v1/classes/{$this->class->id}")
        ->assertOk();

    expect(SchoolClass::find($this->class->id))->toBeNull();
});
