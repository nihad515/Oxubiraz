<?php

use App\Models\ReadingText;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->student = User::factory()->create();
    $this->student->assignRole('student');

    $this->text = ReadingText::create([
        'title' => 'Test Mətn',
        'content' => str_repeat('Lorem ipsum ', 30),
        'language' => 'az',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
        'word_count' => 60,
        'is_active' => true,
        'created_by' => $this->admin->id,
    ]);
});

test('authenticated user can list texts', function () {
    $this->actingAs($this->student)->getJson('/api/v1/texts')
        ->assertOk()
        ->assertJsonStructure(['status', 'data', 'meta']);
});

test('authenticated user can view a text', function () {
    $this->actingAs($this->student)->getJson("/api/v1/texts/{$this->text->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $this->text->id);
});

test('admin can create a text', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/v1/texts', [
        'title' => 'Yeni Mətn',
        'content' => str_repeat('word ', 50),
        'language' => 'az',
        'difficulty' => 'intermediate',
        'age_group' => '11-13',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Yeni Mətn');

    expect(ReadingText::where('title', 'Yeni Mətn')->exists())->toBeTrue();
});

test('student cannot create a text', function () {
    $this->actingAs($this->student)->postJson('/api/v1/texts', [
        'title' => 'Forbidden',
        'content' => str_repeat('word ', 50),
        'language' => 'az',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
    ])->assertForbidden();
});

test('admin can update a text', function () {
    $this->actingAs($this->admin)->patchJson("/api/v1/texts/{$this->text->id}", [
        'title' => 'Updated Title',
    ])->assertOk()->assertJsonPath('data.title', 'Updated Title');

    expect($this->text->fresh()->title)->toBe('Updated Title');
});

test('admin can delete a text', function () {
    $this->actingAs($this->admin)->deleteJson("/api/v1/texts/{$this->text->id}")
        ->assertOk();

    expect(ReadingText::find($this->text->id))->toBeNull();
});

test('text requires a title and content', function () {
    $this->actingAs($this->admin)->postJson('/api/v1/texts', [
        'language' => 'az',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
    ])->assertUnprocessable();
});

test('language must be valid', function () {
    $this->actingAs($this->admin)->postJson('/api/v1/texts', [
        'title' => 'Bad',
        'content' => str_repeat('word ', 50),
        'language' => 'fr',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
    ])->assertUnprocessable();
});
